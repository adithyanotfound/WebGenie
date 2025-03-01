import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StepsList } from "../components/StepsList";
import { FileExplorer } from "../components/FileExplorer";
import { TabView } from "../components/TabView";
import { CodeEditor } from "../components/CodeEditor";
import { PreviewFrame } from "../components/PreviewFrame";
import { Step, FileItem, StepType } from "../types";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { parseXml } from "../steps";
import { useWebContainer } from "../hooks/useWebContainer";
import { Loader } from "../components/Loader";
import { Terminal } from "../components/Terminal";
import { ArrowRight } from "lucide-react";

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "model"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();
  const [logs, setLogs] = useState<string[]>([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  const handleSubmit = () => {
    if (userPrompt.trim()) {
      const newMessage = {
        role: "user" as "user",
        content: userPrompt,
      };

      setLoading(true);
      axios
        .post(`${BACKEND_URL}/chat`, {
          messages: [...llmMessages, newMessage],
        })
        .then((stepsResponse) => {
          setLoading(false);
          setLlmMessages((x) => [...x, newMessage]);
          setLlmMessages((x) => [
            ...x,
            {
              role: "model",
              content: stepsResponse.data.response.text,
            },
          ]);

          setSteps((s) => [
            ...s,
            ...parseXml(stepsResponse.data.response.text).map((x) => ({
              ...x,
              status: "pending" as "pending",
            })),
          ]);
          setPrompt("");
        });
    }
  };

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [];
          let currentFileStructure = [...originalFiles];
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder,
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              /// in a folder
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder,
              );
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder,
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        }),
      );
    }
    console.log(files);
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ]),
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  useEffect(() => {
    async function init() {
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
      });
      setTemplateSet(true);

      const { prompts, uiPrompts } = response.data;

      setSteps(
        parseXml(uiPrompts[0]).map((x: Step) => ({
          ...x,
          status: "pending",
        })),
      );

      setLoading(true);
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...prompts, prompt].map((content) => ({
          role: "user",
          content,
        })),
      });

      setLoading(false);

      setSteps((s) => [
        ...s,
        ...parseXml(stepsResponse.data.response.text).map((x) => ({
          ...x,
          status: "pending" as "pending",
        })),
      ]);

      setLlmMessages(
        [...prompts, prompt].map((content) => ({
          role: "user",
          content,
        })),
      );

      setLlmMessages((x) => [
        ...x,
        { role: "model", content: stepsResponse.data.response.text },
      ]);

      const mainFile = files.find((file) => file.path === "/src/main.tsx");
      if (mainFile) {
        setSelectedFile(mainFile);
      }

      setActiveTab("preview");
    }

    init();
  }, []);

  async function init2() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim(),
    });
    setTemplateSet(true);

    const { prompts, uiPrompts } = response.data;

    setSteps(
      parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending",
      })),
    );

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      })),
    });

    setLoading(false);

    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.response.text).map((x) => ({
        ...x,
        status: "pending" as "pending",
      })),
    ]);

    setLlmMessages(
      [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      })),
    );

    setLlmMessages((x) => [
      ...x,
      { role: "model", content: stepsResponse.data.response.text },
    ]);
  }

  useEffect(() => {
    init2();
  }, []);

  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col">
      <header className="bg-[#1C2128] border-b border-[#30363D] px-6 py-3">
        <h1 className="text-lg font-medium text-[#E6EDF3]">WebGenie</h1>
        <p className="text-sm text-[#768390] mt-1">Prompt: {prompt}</p>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-4 p-8">
          <div className="col-span-1 space-y-6 overflow-auto">
            <div>
              <div className="max-h-[75vh] overflow-scroll">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>
              <div>
                <div className="mt-4">
                  <div className="flex gap-2">
                    {(loading || !templateSet) && <Loader />}
                    {!(loading || !templateSet) && (
                      <div className="flex w-full gap-2">
                        <div className="relative flex-1">
                          <textarea
                            value={userPrompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                              }
                            }}
                            placeholder="Ask a follow up..."
                            className="w-full bg-[#1C2128] border border-[#30363D] rounded-lg text-[#E6EDF3] resize-none focus:outline-none focus:border-[#58A6FF] pl-4 pr-12 py-2.5 h-[46px] overflow-y-auto placeholder:text-[#6E7681] leading-[1.2] text-base"
                          />
                          <button
                            onClick={handleSubmit}
                            disabled={!userPrompt.trim()}
                            className={`absolute right-3 top-[9px] p-1.5 rounded transition-all ${
                              userPrompt.trim()
                                ? "bg-[#0D8AF8] text-white opacity-100"
                                : "opacity-0"
                            }`}
                            aria-label="Submit prompt"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>
          <div className="col-span-2 bg-[#161B22] rounded-lg border border-[#30363D] overflow-hidden h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)]">
              {activeTab === "code" ? (
                <div className="h-full flex flex-col">
                  <div className="flex-1">
                    <CodeEditor file={selectedFile} />
                  </div>
                  <Terminal logs={logs} />
                </div>
              ) : (
                <PreviewFrame
                  //@ts-ignore
                  webContainer={webcontainer}
                  files={files}
                  onLog={(log) => setLogs((prev) => [...prev, log])}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

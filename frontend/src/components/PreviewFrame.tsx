import { WebContainer } from '@webcontainer/api';
import { useEffect, useState, useRef } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
  onLog: (log: string) => void;
}

export function PreviewFrame({ files, webContainer, onLog }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const hasStarted = useRef(false);

  async function main() {
    if (hasStarted.current) return;
    hasStarted.current = true;

    try {
      onLog("Starting installation and development server...");

      const process = await webContainer.spawn('sh', ['-c', 'npm install && npm run dev']);

      process.output.pipeTo(new WritableStream({
        write(data) {
          onLog(data);
        }
      }));

      webContainer.on('server-ready', (port, url) => {
        onLog(`Server ready at ${url}`);
        setUrl(url);
      });
    } catch (error: any) {
      onLog(`Error: ${error.message}`);
      console.error('Error in main function:', error);
      hasStarted.current = false;
    }
  }

  useEffect(() => {
    if (webContainer && !hasStarted.current) {
      main();
    }

    return () => {
      hasStarted.current = false;
    };
  }, [webContainer]);

  return (
    <div className="h-full flex items-center justify-center text-[#8B949E]">
      {!url && <div className="text-center">
        <p className="mb-2">Loading...</p>
      </div>}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}


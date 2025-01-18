import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
  onLog: (log: string) => void;
}
//@ts-ignore
export function PreviewFrame({ files, webContainer, onLog }: PreviewFrameProps) {
  const [url, setUrl] = useState("");

  async function main() {
    const installProcess = await webContainer.spawn('npm', ['install']);

    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        onLog(data);
      }
    }));

    await webContainer.spawn('npm', ['run', 'dev']);
    //@ts-ignore
    webContainer.on('server-ready', (port, url) => {
      onLog(`Server ready at ${url}`);
      setUrl(url);
    });
  }

  useEffect(() => {
    main()
  }, [])

  return (
    <div className="h-full flex items-center justify-center text-[#8B949E]">
      {!url && <div className="text-center">
        <p className="mb-2">Loading...</p>
      </div>}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}


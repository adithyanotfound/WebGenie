import { useEffect, useRef } from 'react';

interface TerminalProps {
  logs: string[];
}

export function Terminal({ logs }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#1E1E1E] border-t border-[#30363D] h-48">
      <div className="flex items-center px-4 py-2 bg-[#252526] border-b border-[#30363D]">
        <span className="text-[#E6EDF3] text-sm font-medium">Terminal</span>
      </div>
      <div 
        ref={terminalRef}
        className="p-4 h-[calc(100%-2.5rem)] overflow-auto font-mono text-sm text-[#E6EDF3] whitespace-pre-wrap"
      >
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}


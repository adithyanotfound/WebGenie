import { Code2, Eye } from 'lucide-react';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
}

export function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="flex border-b border-[#30363D] bg-[#1C2128]">
      <button
        onClick={() => onTabChange('code')}
        className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${activeTab === 'code'
            ? 'text-[#539BF5] border-b-2 border-[#539BF5]'
            : 'text-[#768390] hover:text-[#ADBAC7]'
          }`}
      >
        <Code2 className="w-4 h-4" />
        Code
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${activeTab === 'preview'
            ? 'text-[#539BF5] border-b-2 border-[#539BF5]'
            : 'text-[#768390] hover:text-[#ADBAC7]'
          }`}
      >
        <Eye className="w-4 h-4" />
        Preview
      </button>
    </div>

  );
}


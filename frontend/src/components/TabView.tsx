import { Code2, Eye } from 'lucide-react';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
}

export function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="flex border-b border-[#30363D]">
      <button
        onClick={() => onTabChange('code')}
        className={`flex items-center gap-2 px-6 py-3 transition-colors border-b-2 ${
          activeTab === 'code'
            ? 'text-[#58A6FF] border-[#58A6FF]'
            : 'text-[#8B949E] border-transparent hover:text-[#E6EDF3]'
        }`}
      >
        <Code2 className="w-4 h-4" />
        Code
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={`flex items-center gap-2 px-6 py-3 transition-colors border-b-2 ${
          activeTab === 'preview'
            ? 'text-[#58A6FF] border-[#58A6FF]'
            : 'text-[#8B949E] border-transparent hover:text-[#E6EDF3]'
        }`}
      >
        <Eye className="w-4 h-4" />
        Preview
      </button>
    </div>
  );
}


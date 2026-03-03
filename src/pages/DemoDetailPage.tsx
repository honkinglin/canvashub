import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings2, Code, LayoutTemplate } from 'lucide-react';
import { getBackgroundById } from '../backgrounds';
import CanvasBackground from '../components/CanvasBackground';
import ConfigPanel from '../components/ConfigPanel';
import CodeRenderer from '../components/CodeRenderer';

export default function DemoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bgModule = getBackgroundById(id || '');

  const [config, setConfig] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'config' | 'code'>('config');

  useEffect(() => {
    if (bgModule) {
      setConfig(bgModule.defaultConfig);
    }
  }, [bgModule]);

  if (!bgModule) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Background not found</h2>
        <button onClick={() => navigate('/')} className="text-blue-500 hover:text-blue-400">
          Return to Gallery
        </button>
      </div>
    );
  }

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row relative">
      <div className="flex-1 relative overflow-hidden order-2 lg:order-1 h-[52vh] lg:h-full bg-[#0f172a]">
        {Object.keys(config).length > 0 && (
          <CanvasBackground 
            config={config} 
            renderFn={bgModule.render} 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute left-5 bottom-5 md:left-8 md:bottom-8 pointer-events-none">
          <h2 className="display-title text-2xl md:text-4xl text-white mb-2">{bgModule.name}</h2>
          <p className="text-sm md:text-base text-white/80 max-w-md">{bgModule.description}</p>
        </div>
      </div>

      <div className="w-full lg:w-[430px] glass-panel border-t lg:border-t-0 lg:border-l border-black/10 flex flex-col order-1 lg:order-2 z-10 h-[48vh] lg:h-full overflow-hidden shadow-[0_10px_36px_rgba(15,23,42,0.14)]">
        <div className="p-4 border-b border-black/10 flex items-center justify-between bg-white/40">
          <button 
            onClick={() => navigate('/')}
            className="text-[#64748b] hover:text-[#111827] transition-colors p-2 -ml-2 rounded-lg hover:bg-black/5 flex items-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-[#0f172a]">{bgModule.name}</span>
          <div className="w-9" />
        </div>

        <div className="flex items-center gap-2 p-4 border-b border-black/10">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
              activeTab === 'config' ? 'bg-[#0864ef] text-white shadow-[0_8px_20px_rgba(8,100,239,0.3)]' : 'bg-black/5 text-[#4b5563] hover:text-[#111827] hover:bg-black/10'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            参数
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
              activeTab === 'code' ? 'bg-[#0864ef] text-white shadow-[0_8px_20px_rgba(8,100,239,0.3)]' : 'bg-black/5 text-[#4b5563] hover:text-[#111827] hover:bg-black/10'
            }`}
          >
            <Code className="w-4 h-4" />
            代码
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'config' ? (
            <div className="space-y-6">
              <div className="rounded-2xl p-4 border border-black/10 bg-white/70">
                <div className="flex items-center gap-2 mb-4 text-[#334155] font-semibold">
                  <LayoutTemplate className="w-4 h-4 text-[#0864ef]" />
                  控制面板
                </div>
                <ConfigPanel 
                  schema={bgModule.configSchema}
                  config={config}
                  onChange={handleConfigChange}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#5b6570]">
                复制下面的 React 代码即可使用。建议先在当前页面把参数调到你想要的视觉效果，再拷贝到业务项目。
              </p>
              <CodeRenderer code={bgModule.generateCode(config as any)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

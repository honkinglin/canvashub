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
      {/* Background Preview */}
      <div className="flex-1 relative overflow-hidden order-2 lg:order-1 h-[50vh] lg:h-full">
        {Object.keys(config).length > 0 && (
          <CanvasBackground 
            config={config} 
            renderFn={bgModule.render} 
          />
        )}
      </div>

      {/* Control Panel Overlay / Sidebar */}
      <div className="w-full lg:w-[420px] bg-slate-950/90 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col order-1 lg:order-2 z-10 h-[50vh] lg:h-full overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <button 
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-800 flex items-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-slate-200">{bgModule.name}</span>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-4 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all \${
              activeTab === 'config' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            Config
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all \${
              activeTab === 'code' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'config' ? (
            <div className="space-y-6">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium">
                  <LayoutTemplate className="w-4 h-4 text-blue-400" />
                  Parameters
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
              <p className="text-sm text-slate-400">
                Copy this React component and drop it into your project. Make sure you have the required dependencies (like canvas-related types if using TS).
              </p>
              <CodeRenderer code={bgModule.generateCode(config as any)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

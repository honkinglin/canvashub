import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Config } from '../types/canvas';
import { getBackground } from '../backgrounds/registry';
import { CanvasBackground } from '../components/CanvasBackground';
import { ControlPanel } from '../components/ControlPanel';
import { CodeViewer } from '../components/CodeViewer';

export function DemoPage() {
  const { id } = useParams<{ id: string }>();
  const background = id ? getBackground(id) : undefined;

  const [config, setConfig] = useState<Config>(() => background?.defaultConfig ?? {});

  const code = useMemo(() => {
    if (!background) return '';
    return background.generateCode(config);
  }, [background, config]);

  if (!background) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Background not found</h2>
          <Link to="/" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
            ← Gallery
          </Link>
          <div className="h-4 w-px bg-gray-700" />
          <h1 className="text-white font-semibold">{background.name}</h1>
          <div className="flex gap-2 ml-2">
            {background.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Canvas preview */}
        <div className="lg:flex-1 relative bg-gray-900 min-h-64 lg:min-h-0">
          <CanvasBackground
            key={JSON.stringify(config)}
            background={background}
            config={config}
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Controls + Code */}
        <div className="w-full lg:w-96 bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Parameters</h2>
            <ControlPanel background={background} config={config} onChange={setConfig} />
          </div>

          <div className="p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Generated Code</h2>
            <CodeViewer code={code} />
          </div>
        </div>
      </div>
    </div>
  );
}

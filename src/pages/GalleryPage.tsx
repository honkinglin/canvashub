import { backgroundRegistry } from '../backgrounds/registry';
import { DemoCard } from '../components/DemoCard';

export function GalleryPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-white">CanvasHub</span>
          <span className="text-gray-500 text-sm ml-2">Beautiful animated canvas backgrounds</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Canvas Backgrounds
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Explore beautiful animated HTML5 canvas backgrounds. Customize parameters and copy the code.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {backgroundRegistry.map((bg) => (
            <DemoCard key={bg.id} background={bg} />
          ))}
        </div>
      </main>
    </div>
  );
}

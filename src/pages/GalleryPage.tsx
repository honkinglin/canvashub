import { Link } from 'react-router-dom';
import { backgrounds } from '../backgrounds';
import CanvasBackground from '../components/CanvasBackground';

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl text-center mx-auto mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
          Beautiful Canvas Backgrounds
        </h1>
        <p className="text-lg text-slate-400">
          A collection of interactive, customizable HTML5 canvas animations perfect for your next web project. 
          Configure parameters and simply copy the React snippet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {backgrounds.map((bg) => (
          <Link 
            key={bg.id} 
            to={`/bg/${bg.id}`}
            className="group block rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-950">
              <CanvasBackground 
                config={bg.defaultConfig} 
                renderFn={bg.render} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {bg.name}
              </h3>
              <p className="text-sm text-slate-400 line-clamp-2">
                {bg.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

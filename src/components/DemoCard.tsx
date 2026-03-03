import { Link } from 'react-router-dom';
import type { BackgroundDefinition, Config } from '../types/canvas';
import { CanvasBackground } from './CanvasBackground';

interface Props {
  background: BackgroundDefinition<Config>;
}

export function DemoCard({ background }: Props) {
  return (
    <Link
      to={`/demo/${background.id}`}
      className="group block rounded-xl overflow-hidden border border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 bg-gray-900"
    >
      <div className="relative h-48 overflow-hidden">
        <CanvasBackground
          background={background}
          config={background.defaultConfig}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg group-hover:text-indigo-400 transition-colors">
          {background.name}
        </h3>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{background.description}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {background.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

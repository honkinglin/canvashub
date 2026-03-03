import { Outlet, Link } from 'react-router-dom';
import { Github } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-white hover:text-blue-400 transition-colors">
            <img src="/logo.png" alt="CanvasHub Logo" className="w-8 h-8 rounded" />
            <span className="font-bold text-xl tracking-tight">CanvasHub</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Gallery
            </Link>
            <a 
              href="https://github.com/honkinglin/canvashub" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet, Link } from 'react-router-dom';
import { Github } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="soft-dot w-64 h-64 bg-[#9ec4ff] -top-12 -left-10" />
      <div className="soft-dot w-72 h-72 bg-[#ffc2a8] top-10 right-0" />
      <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/65 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-[#141414] hover:text-[#0864ef] transition-colors">
            <img src="/logo.png" alt="CanvasHub Logo" className="w-8 h-8 rounded" />
            <span className="font-semibold text-xl tracking-tight">CanvasHub</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/" className="text-sm font-semibold text-[#334155] hover:text-[#0864ef] transition-colors">
              Gallery
            </Link>
            <a 
              href="https://github.com/honkinglin/canvashub" 
              target="_blank" 
              rel="noreferrer"
              className="text-[#475569] hover:text-[#141414] transition-colors bg-black/5 hover:bg-black/10 p-2 rounded-full"
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

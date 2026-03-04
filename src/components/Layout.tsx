import { Outlet, Link } from 'react-router-dom';
import { Github, MoonStar, SunMedium } from 'lucide-react';
import { localeText } from '../i18n';
import { useUI } from '../ui/UIContext';

export default function Layout() {
  const { language, setLanguage, theme, toggleTheme } = useUI();
  const text = localeText[language];

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="soft-dot w-64 h-64 bg-[#9ec4ff] -top-12 -left-10" />
      <div className="soft-dot w-72 h-72 bg-[#ffc2a8] top-10 right-0" />
      <header className="sticky top-0 z-50 w-full border-b bg-[var(--topbar-bg)] border-[color:var(--surface-border)] backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-3 text-[var(--text-main)] hover:text-[#0864ef] transition-colors">
            <img src="/logo.png" alt="CanvasHub Logo" className="w-8 h-8 rounded" />
            <span className="font-semibold text-lg tracking-tight">CanvasHub</span>
          </Link>

          <nav className="flex items-center gap-2 md:gap-3">
            <div className="ui-pill rounded-full p-1 flex items-center gap-1">
              <button
                onClick={() => setLanguage('zh')}
                aria-label={text.navLanguageToggle}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${language === 'zh' ? 'ui-pill-active' : ''}`}
              >
                {text.langZh}
              </button>
              <button
                onClick={() => setLanguage('en')}
                aria-label={text.navLanguageToggle}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${language === 'en' ? 'ui-pill-active' : ''}`}
              >
                {text.langEn}
              </button>
            </div>

            <button
              onClick={toggleTheme}
              aria-label={text.navThemeToggle}
              className="ui-pill rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors hover:text-[var(--text-main)] flex items-center gap-1.5"
            >
              {theme === 'dark' ? <MoonStar className="w-3.5 h-3.5" /> : <SunMedium className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{theme === 'dark' ? text.themeDark : text.themeLight}</span>
            </button>

            <a
              href="https://github.com/honkinglin/canvashub"
              target="_blank"
              rel="noreferrer"
              aria-label={text.navGithubLabel}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors ui-pill p-2 rounded-full"
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

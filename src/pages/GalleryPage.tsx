import { Link } from 'react-router-dom';
import { backgrounds } from '../backgrounds';
import CanvasBackground from '../components/CanvasBackground';
import { getBackgroundLocalized, localeText } from '../i18n';
import { useUI } from '../ui/UIContext';
import type { CanvasRenderFunction, ConfigRecord } from '../types';

export default function GalleryPage() {
  const { language } = useUI();
  const text = localeText[language];

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <section className="max-w-4xl mx-auto mb-12 md:mb-16 text-center reveal">
        <p className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold glass-panel ui-muted">
          {text.heroBadge}
        </p>
        <h1 className="display-title mt-5 text-4xl md:text-6xl leading-tight text-[var(--text-main)]">
          {text.heroTitleLine1}
          <span className="block text-[#0864ef]">{text.heroTitleLine2}</span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg ui-muted">
          {text.heroDescription}
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
        {backgrounds.map((bg, index) => {
          const localized = getBackgroundLocalized(language, bg.id, bg.name, bg.description);
          return (
          <Link 
            key={bg.id} 
            to={`/bg/${bg.id}`}
            className="group reveal glass-panel block rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(8,100,239,0.18)]"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="aspect-[4/3] relative overflow-hidden bg-[#0f172a]">
              <CanvasBackground 
                config={bg.defaultConfig as ConfigRecord}
                renderFn={bg.render as CanvasRenderFunction<ConfigRecord>}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>
              <span className="absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold bg-white/90 text-[#1f2937]">
                {text.livePreview}
              </span>
            </div>
            <div className="p-5 md:p-6">
              <h3 className="text-xl font-semibold text-[var(--text-main)] mb-2 group-hover:text-[#0864ef] transition-colors">
                {localized.name}
              </h3>
              <p className="text-sm ui-muted line-clamp-2">
                {localized.description}
              </p>
              <p className="mt-4 text-xs tracking-[0.12em] uppercase ui-muted">{text.exploreTemplate}</p>
            </div>
          </Link>
          );
        })}
      </section>
    </div>
  );
}

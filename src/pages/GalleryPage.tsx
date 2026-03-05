import { Link } from 'react-router-dom';
import { backgrounds } from '../backgrounds';
import CanvasBackground from '../components/CanvasBackground';
import HomeAmbientCanvas from '../components/HomeAmbientCanvas';
import { getBackgroundLocalized, localeText } from '../i18n';
import { useUI } from '../ui/UIContext';
import type { CanvasRenderFunction, ConfigRecord } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

export default function GalleryPage() {
  const { language, theme } = useUI();
  const text = localeText[language];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <HomeAmbientCanvas theme={theme} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.34),transparent_58%)] dark:bg-[radial-gradient(circle_at_50%_15%,rgba(5,8,16,0.16),transparent_58%)]" />
      </div>

      <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
        <section className="max-w-4xl mx-auto mb-12 md:mb-16 text-center reveal">
          <Badge variant="secondary" className="px-4 py-1.5 text-xs md:text-sm font-semibold">
            {text.heroBadge}
          </Badge>
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
              <Link key={bg.id} to={`/bg/${bg.id}`} className="group reveal block transition-all duration-300 hover:-translate-y-1.5" style={{ animationDelay: `${index * 90}ms` }}>
                <Card className="overflow-hidden rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] transition-all duration-300 group-hover:shadow-[0_18px_40px_rgba(8,100,239,0.18)]">
                  <div className="aspect-[4/3] relative overflow-hidden bg-[#0f172a]">
                    <CanvasBackground config={bg.defaultConfig as ConfigRecord} renderFn={bg.render as CanvasRenderFunction<ConfigRecord>} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                    <Badge className="absolute top-3 left-3 text-[11px] bg-white/95 text-[#1f2937]">{text.livePreview}</Badge>
                  </div>
                  <CardContent className="p-5 md:p-6">
                    <CardTitle className="mb-2 text-[var(--text-main)] group-hover:text-[#0864ef] transition-colors">{localized.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-[var(--text-muted)]">{localized.description}</CardDescription>
                    <div className="mt-3">
                      <Button variant="link" className="px-0 text-[var(--text-muted)] hover:text-[#0864ef]">
                        {text.exploreTemplate}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}

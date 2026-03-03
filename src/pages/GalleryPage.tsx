import { Link } from 'react-router-dom';
import { backgrounds } from '../backgrounds';
import CanvasBackground from '../components/CanvasBackground';

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <section className="max-w-4xl mx-auto mb-12 md:mb-16 text-center reveal">
        <p className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold bg-white/80 border border-black/10 text-[#334155]">
          Curated Canvas Motion Library
        </p>
        <h1 className="display-title mt-5 text-4xl md:text-6xl leading-tight text-[#111827]">
          让你的首页第一屏
          <span className="block text-[#0864ef]">更有动态质感</span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-[#495661]">
          直接预览、实时调参、复制代码。每个背景都面向展示型网站优化，适合品牌官网、作品集和活动落地页。
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
        {backgrounds.map((bg, index) => (
          <Link 
            key={bg.id} 
            to={`/bg/${bg.id}`}
            className="group reveal glass-panel block rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(8,100,239,0.18)]"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="aspect-[4/3] relative overflow-hidden bg-[#0f172a]">
              <CanvasBackground 
                config={bg.defaultConfig} 
                renderFn={bg.render} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>
              <span className="absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold bg-white/90 text-[#1f2937]">
                Live Preview
              </span>
            </div>
            <div className="p-5 md:p-6">
              <h3 className="text-xl font-semibold text-[#111827] mb-2 group-hover:text-[#0864ef] transition-colors">
                {bg.name}
              </h3>
              <p className="text-sm text-[#56616b] line-clamp-2">
                {bg.description}
              </p>
              <p className="mt-4 text-xs tracking-[0.12em] uppercase text-[#6b7280]">Explore Template</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

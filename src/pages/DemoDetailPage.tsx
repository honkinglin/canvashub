import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Code, LayoutTemplate, Settings2 } from 'lucide-react';
import { getBackgroundById } from '../backgrounds';
import CanvasBackground from '../components/CanvasBackground';
import ConfigPanel from '../components/ConfigPanel';
import CodeRenderer from '../components/CodeRenderer';
import { getBackgroundLocalized, localeText } from '../i18n';
import { useUI } from '../ui/UIContext';
import type { CanvasRenderFunction, ConfigRecord, ConfigValue } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type CodeFormat = 'html' | 'javascript';

function splitHtmlAndJs(code: string): { html: string; javascript: string } {
  const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) {
    return { html: code, javascript: code };
  }

  const fullScriptBlock = scriptMatch[0];
  const scriptContent = (scriptMatch[1] || '').trim();
  const htmlWithoutScript = code.replace(fullScriptBlock, '<script src="./effect.js"></script>');

  return {
    html: htmlWithoutScript.trim(),
    javascript: scriptContent,
  };
}

function DemoDetailContent({
  bgModule,
  language,
  text,
  navigate,
}: {
  bgModule: NonNullable<ReturnType<typeof getBackgroundById>>;
  language: 'zh' | 'en';
  text: (typeof localeText)['zh'];
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [config, setConfig] = useState<ConfigRecord>({ ...(bgModule.defaultConfig as ConfigRecord) });
  const [activeTab, setActiveTab] = useState<'config' | 'code'>('config');
  const [codeFormat, setCodeFormat] = useState<CodeFormat>('html');

  const handleConfigChange = (key: string, value: ConfigValue) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const localized = getBackgroundLocalized(language, bgModule.id, bgModule.name, bgModule.description);
  const generatedCode = (bgModule.generateCode as (value: ConfigRecord) => string)(config);
  const splitCode = splitHtmlAndJs(generatedCode);
  const codeToRender = codeFormat === 'html' ? splitCode.html : splitCode.javascript;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row relative">
      <div className="flex-1 relative overflow-hidden order-2 lg:order-1 h-[52vh] lg:h-full bg-[#0f172a]">
        <CanvasBackground config={config} renderFn={bgModule.render as CanvasRenderFunction<ConfigRecord>} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute left-5 bottom-5 md:left-8 md:bottom-8 pointer-events-none">
          <h2 className="display-title text-xl md:text-3xl text-white mb-2">{localized.name}</h2>
          <p className="text-xs md:text-sm text-white/80 max-w-md">{localized.description}</p>
        </div>
      </div>

      <div className="w-full lg:w-[430px] glass-panel border-t lg:border-t-0 lg:border-l border-[color:var(--surface-border)] flex flex-col order-1 lg:order-2 z-10 h-[48vh] lg:h-full overflow-hidden shadow-[0_10px_36px_rgba(15,23,42,0.18)]">
        <div className="p-4 border-b border-[color:var(--surface-border)] flex items-center justify-between bg-[var(--surface-soft)]">
          <Button onClick={() => navigate('/')} size="icon" variant="ghost" className="-ml-2 text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-sm text-[var(--text-main)]">{localized.name}</span>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'config' | 'code')}>
            <TabsList className="w-full grid grid-cols-2 bg-black/10">
              <TabsTrigger value="config" className="gap-2 data-[state=active]:bg-[#0864ef] data-[state=active]:text-white">
                <Settings2 className="w-4 h-4" />
                {text.tabConfig}
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2 data-[state=active]:bg-[#0864ef] data-[state=active]:text-white">
                <Code className="w-4 h-4" />
                {text.tabCode}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config">
              <Card className="rounded-2xl border-[var(--surface-border)] bg-[var(--surface-soft)] shadow-none">
                <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-[#0864ef]" />
                  {text.panelTitle}
                </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <ConfigPanel schema={bgModule.configSchema} config={config} onChange={handleConfigChange} language={language} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <p className="text-sm ui-muted">{text.codeHint}</p>
              <div className="ui-pill inline-flex rounded-full p-1">
                <button
                  onClick={() => setCodeFormat('html')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${codeFormat === 'html' ? 'ui-pill-active' : ''}`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setCodeFormat('javascript')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${codeFormat === 'javascript' ? 'ui-pill-active' : ''}`}
                >
                  JavaScript
                </button>
              </div>
              <CodeRenderer
                code={codeToRender}
                language={codeFormat}
                copyLabel={text.detailCopy}
                copiedLabel={text.detailCopied}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function DemoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bgModule = getBackgroundById(id || '');
  const { language } = useUI();
  const text = localeText[language];

  if (!bgModule) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-[var(--text-main)]">{text.notFoundTitle}</h2>
        <Button onClick={() => navigate('/')} variant="secondary">
          {text.notFoundButton}
        </Button>
      </div>
    );
  }

  return <DemoDetailContent key={bgModule.id} bgModule={bgModule} language={language} text={text} navigate={navigate} />;
}

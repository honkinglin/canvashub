import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeRendererProps {
  code: string;
}

export default function CodeRenderer({ code }: CodeRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-[#0b1220] border border-black/10 shadow-[0_8px_30px_rgba(15,23,42,0.2)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#111827] border-b border-white/10">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
          <div className="w-3 h-3 rounded-full bg-[#facc15]"></div>
          <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
        </div>
        <button
          onClick={handleCopy}
          className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono">
        <Highlight theme={themes.nightOwl} code={code} language="tsx">
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={{ ...style, backgroundColor: 'transparent' }}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}

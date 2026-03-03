import type { ConfigSchemaItem } from '../types';
import { getConfigLabelLocalized } from '../i18n';
import type { Language } from '../ui/UIContext';

interface ConfigPanelProps {
  schema: ConfigSchemaItem[];
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
  language: Language;
}

export default function ConfigPanel({ schema, config, onChange, language }: ConfigPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {schema.map((item) => {
        const value = config[item.id];
        const label = getConfigLabelLocalized(language, item.label);

        return (
          <div key={item.id} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-semibold">
              <label htmlFor={item.id}>{label}</label>
              {item.type === 'range' && <span>{value}</span>}
              {item.type === 'number' && typeof value === 'number' && <span>{value.toFixed(2)}</span>}
            </div>

            {item.type === 'range' && (
              <input
                id={item.id}
                type="range"
                className="w-full accent-[#0864ef] h-1.5 bg-black/20 rounded-lg appearance-none cursor-pointer"
                min={item.options?.min || 0}
                max={item.options?.max || 100}
                step={item.options?.step || 1}
                value={value}
                onChange={(e) => onChange(item.id, parseFloat(e.target.value))}
              />
            )}

            {item.type === 'number' && (
                <input
                  id={item.id}
                  type="number"
                className="w-full bg-black/10 border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[#0864ef] transition-colors"
                min={item.options?.min}
                max={item.options?.max}
                step={item.options?.step}
                value={value}
                onChange={(e) => onChange(item.id, parseFloat(e.target.value))}
              />
            )}

            {item.type === 'color' && (
              <div className="flex items-center gap-3">
                <input
                  id={item.id}
                  type="color"
                  className="w-9 h-9 rounded-md cursor-pointer border-0 bg-transparent p-0"
                  value={value}
                  onChange={(e) => onChange(item.id, e.target.value)}
                />
                <span className="text-xs font-mono text-[var(--text-muted)] uppercase">{value}</span>
              </div>
            )}

            {item.type === 'boolean' && (
              <button
                id={item.id}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  value ? 'bg-[#0864ef]' : 'bg-black/30'
                }`}
                onClick={() => onChange(item.id, !value)}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            )}

            {item.type === 'select' && item.options?.options && (
              <select
                id={item.id}
                className="w-full bg-black/10 border border-[color:var(--surface-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[#0864ef] transition-colors"
                value={value}
                onChange={(e) => onChange(item.id, e.target.value)}
              >
                {item.options.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}

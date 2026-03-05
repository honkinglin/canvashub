import type { ConfigSchemaItem, ConfigRecord, ConfigValue } from '../types';
import { getConfigLabelLocalized } from '../i18n';
import type { Language } from '../ui/UIContext';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConfigPanelProps {
  schema: ConfigSchemaItem[];
  config: ConfigRecord;
  onChange: (key: string, value: ConfigValue) => void;
  language: Language;
}

export default function ConfigPanel({ schema, config, onChange, language }: ConfigPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {schema.map((item) => {
        const value = config[item.id];
        const label = getConfigLabelLocalized(language, item.label);
        const numberValue = typeof value === 'number' ? value : 0;
        const colorValue = typeof value === 'string' ? value : '#000000';
        const booleanValue = typeof value === 'boolean' ? value : false;
        const selectValue = typeof value === 'string' ? value : '';
        const textValue = typeof value === 'string' ? value : '';

        return (
          <div key={item.id} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)] font-semibold">
              <label htmlFor={item.id}>{label}</label>
              {item.type === 'range' && <span>{numberValue}</span>}
              {item.type === 'number' && <span>{numberValue.toFixed(2)}</span>}
            </div>

            {item.type === 'range' && (
              <Slider
                min={item.options?.min || 0}
                max={item.options?.max || 100}
                step={item.options?.step || 1}
                value={[numberValue]}
                onValueChange={(next) => onChange(item.id, next[0] ?? numberValue)}
              />
            )}

            {item.type === 'number' && (
              <Input
                id={item.id}
                type="number"
                className="bg-black/10"
                min={item.options?.min}
                max={item.options?.max}
                step={item.options?.step}
                value={numberValue}
                onChange={(e) => onChange(item.id, parseFloat(e.target.value))}
              />
            )}

            {item.type === 'color' && (
              <div className="flex items-center gap-3">
                <input
                  id={item.id}
                  type="color"
                  className="w-8 h-8 rounded-md cursor-pointer border-0 bg-transparent p-0"
                  value={colorValue}
                  onChange={(e) => onChange(item.id, e.target.value)}
                />
                <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">{colorValue}</span>
              </div>
            )}

            {item.type === 'boolean' && (
              <Switch
                id={item.id}
                checked={booleanValue}
                onCheckedChange={(checked) => onChange(item.id, checked)}
                className="data-[state=checked]:bg-[#0864ef] data-[state=unchecked]:bg-black/30"
              />
            )}

            {item.type === 'select' && item.options?.options && (
              <Select value={selectValue} onValueChange={(value) => onChange(item.id, value)}>
                <SelectTrigger id={item.id} className="w-full bg-black/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {item.options.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {item.type === 'text' && (
              <Input
                id={item.id}
                type="text"
                className="bg-black/10"
                value={textValue}
                onChange={(e) => onChange(item.id, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

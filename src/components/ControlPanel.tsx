import type { Config, BackgroundDefinition, ConfigField } from '../types/canvas';

interface Props {
  background: BackgroundDefinition<Config>;
  config: Config;
  onChange: (config: Config) => void;
}

function FieldInput({
  fieldKey,
  field,
  value,
  onChange,
}: {
  fieldKey: string;
  field: ConfigField;
  value: number | string;
  onChange: (key: string, value: number | string) => void;
}) {
  if (field.type === 'color') {
    return (
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value as string}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
        />
        <span className="text-gray-400 text-sm font-mono">{value as string}</span>
      </div>
    );
  }

  if (field.type === 'range') {
    const numVal = value as number;
    return (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-sm text-gray-400">
          <span>{field.min}</span>
          <span className="font-mono text-indigo-400">{numVal}</span>
          <span>{field.max}</span>
        </div>
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={numVal}
          onChange={(e) => onChange(fieldKey, parseFloat(e.target.value))}
          className="w-full accent-indigo-500"
        />
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value as number}
        onChange={(e) => onChange(fieldKey, parseFloat(e.target.value))}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
      />
    );
  }

  if (field.type === 'select' && field.options) {
    return (
      <select
        value={value as string}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
      >
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return null;
}

export function ControlPanel({ background, config, onChange }: Props) {
  const handleChange = (key: string, value: number | string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-5">
      {Object.entries(background.configSchema).map(([key, field]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
          <FieldInput
            fieldKey={key}
            field={field}
            value={config[key]}
            onChange={handleChange}
          />
        </div>
      ))}
    </div>
  );
}

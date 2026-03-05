export type ConfigType = 'number' | 'range' | 'color' | 'boolean' | 'select' | 'text';
export type ConfigValue = number | string | boolean;
export type ConfigRecord = Record<string, ConfigValue>;

export interface ConfigOptions {
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface ConfigSchemaItem {
  id: string;
  label: string;
  type: ConfigType;
  options?: ConfigOptions;
}

export type CanvasRenderFunction<T = ConfigRecord> = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  config: T
) => { cleanup: () => void; updateConfig: (newConfig: T) => void };

export interface BackgroundModule<T = ConfigRecord> {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  configSchema: ConfigSchemaItem[];
  defaultConfig: T;
  render: CanvasRenderFunction<T>;
  generateCode: (config: T) => string;
}

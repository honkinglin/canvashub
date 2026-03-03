export type ConfigType = 'number' | 'range' | 'color' | 'boolean' | 'select';

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

export type CanvasRenderFunction<T = Record<string, any>> = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  config: T
) => { cleanup: () => void; updateConfig: (newConfig: T) => void };

export interface BackgroundModule<T = Record<string, any>> {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  configSchema: ConfigSchemaItem[];
  defaultConfig: T;
  render: CanvasRenderFunction<T>;
  generateCode: (config: T) => string;
}

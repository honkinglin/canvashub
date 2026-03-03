export type ConfigFieldType = 'number' | 'color' | 'range' | 'select';

export interface ConfigField {
  type: ConfigFieldType;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
}

export type Config = Record<string, number | string>;

export interface BackgroundDefinition<T extends Config = Config> {
  id: string;
  name: string;
  description: string;
  tags: string[];
  defaultConfig: T;
  configSchema: Record<keyof T & string, ConfigField>;
  generateCode: (config: T) => string;
  render: (canvas: HTMLCanvasElement, config: T) => () => void;
}

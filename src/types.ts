
export interface PhotoPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
}

export type BackgroundColor = 'white' | 'blue' | 'red' | 'custom';

export type APIProvider = 'siliconflow' | 'openrouter' | 'tongyi';

export interface APIConfig {
  provider: APIProvider;
  apiKey: string;
  baseURL: string;
  model: string;
}

export interface AppState {
  step: 'camera' | 'processing' | 'result';
  rawImage: string | null;
  processedImage: string | null;
  selectedColor: BackgroundColor;
  customColor: string;
  selectedPresetId: string;
  customWidth: number;
  customHeight: number;
  dpi: number;
  apiConfig: APIConfig;
  error: string | null;
}

export const PHOTO_PRESETS: PhotoPreset[] = [
  { id: '1inch', name: '一寸', widthMm: 25, heightMm: 35, description: '25x35mm' },
  { id: '2inch', name: '二寸', widthMm: 35, heightMm: 49, description: '35x49mm' },
  { id: 'passport', name: '大二寸/护照', widthMm: 33, heightMm: 48, description: '33x48mm' },
  { id: 'custom', name: '自定义', widthMm: 0, heightMm: 0, description: '自定义宽高' },
];

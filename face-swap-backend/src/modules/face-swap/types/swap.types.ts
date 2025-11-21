export interface SwapOptions {
  blendMode: 'normal' | 'smooth' | 'seamless';
  colorMatch: boolean;
  featherRadius: number;
  alphaBlend: number;
}

export interface TransformMatrix {
  rotation: number;
  scale: { x: number; y: number };
  translation: { x: number; y: number };
}

export interface ColorAdjustment {
  brightness: number;
  contrast: number;
  saturation: number;
}


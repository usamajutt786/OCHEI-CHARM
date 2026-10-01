/**
 * Types for Iris Studio fine-art photography and subscription platform
 */

export type UserRole = 'admin' | 'studio_user';
export type AccountStatus = 'active' | 'expired' | 'blocked';

export interface LoginEvent {
  id: string;
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  status: 'success' | 'blocked_attempt' | 'expired_warning';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  subscriptionExpiry: string; // ISO date string
  remainingDays: number;
  planName: string;
  createdAt: string;
  lastLogin: string;
  avatarUrl?: string;
  notes?: string;
  loginHistory: LoginEvent[];
}

export interface AdjustmentValues {
  exposure: number;     // -100 to 100 (0 default)
  brightness: number;   // -100 to 100 (0 default)
  contrast: number;     // -100 to 100 (0 default)
  saturation: number;   // -100 to 100 (0 default)
  temperature: number;  // -100 (cool) to 100 (warm)
  sharpness: number;    // 0 to 100
  brownTone: number;    // -100 to 100 (adjust melanin / hazel warmth)
  greenTint: number;    // -100 to 100 (adjust green pigment flecks)
}

export interface IrisMaskConfig {
  enabled: boolean;
  irisCenterX: number; // 0 to 100 (%)
  irisCenterY: number; // 0 to 100 (%)
  irisRadius: number;  // 10 to 60 (%)
  pupilCenterX: number; // 0 to 100 (%)
  pupilCenterY: number; // 0 to 100 (%)
  pupilRadius: number; // 2 to 30 (%)
  feather: number;     // 0 to 30 (px)
}

export interface IrisImage {
  id: string;
  name: string;
  originalUrl: string;
  enhancedUrl?: string;
  isEnhanced: boolean;
  uploadedAt: string;
  width: number;
  height: number;
  isSample?: boolean;
  adjustments: AdjustmentValues;
  maskConfig: IrisMaskConfig;
  eyeSide?: 'left' | 'right' | 'unknown';
}

export type EffectPreset = 
  | 'isolated'       // Clean isolated iris on black / transparent
  | 'diagonal_duo'   // Diagonal two-iris artistic composition
  | 'infinity'       // Overlapping infinity twin composition
  | 'shards'         // Geometric stardust & crystal particle explosion
  | 'lunar_stars';   // Celestial lunar glow with deep starfield

export interface EffectSettings {
  preset: EffectPreset;
  secondIrisId?: string;
  irisScale: number;        // 0.5 to 1.8
  posX: number;             // -200 to 200
  posY: number;             // -200 to 200
  dualDistance: number;     // 100 to 600
  swapPositions: boolean;
  glowColor: string;        // Hex code
  glowIntensity: number;    // 0 to 100
  showStars: boolean;
  starBrightness: number;   // 10 to 100
  bgStyle: 'pure_black' | 'deep_navy' | 'transparent';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

import { AdjustmentValues, IrisMaskConfig } from '../types';

/**
 * High-performance Canvas Image Processing Engine for Iris Fine Art
 */

export interface RenderOptions {
  width?: number;
  height?: number;
  applyMask?: boolean;
  background?: 'transparent' | 'pure_black' | 'deep_navy';
}

/**
 * Helper to convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s, l];
}

/**
 * Helper to convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = (h % 360 + 360) % 360;
  h /= 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Apply real-time photographic adjustments and iris masking onto a canvas context
 */
export function renderProcessedImage(
  sourceImage: HTMLImageElement,
  targetCanvas: HTMLCanvasElement,
  adjustments: AdjustmentValues,
  maskConfig: IrisMaskConfig,
  options: RenderOptions = {}
): void {
  const width = options.width || sourceImage.naturalWidth || sourceImage.width || 1024;
  const height = options.height || sourceImage.naturalHeight || sourceImage.height || 1024;

  targetCanvas.width = width;
  targetCanvas.height = height;

  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // Background
  if (options.background === 'pure_black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  } else if (options.background === 'deep_navy') {
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  // Draw source image onto offscreen or direct
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  if (!tempCtx) return;

  tempCtx.drawImage(sourceImage, 0, 0, width, height);
  const imgData = tempCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Compute adjustment factors
  const exposureFactor = Math.pow(2, adjustments.exposure / 60);
  const brightnessOffset = (adjustments.brightness / 100) * 80;
  const contrastFactor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
  const satFactor = 1 + adjustments.saturation / 100;
  const tempShift = adjustments.temperature / 100; // -1 to 1
  const brownShift = adjustments.brownTone / 100; // -1 to 1
  const greenShift = adjustments.greenTint / 100; // -1 to 1

  // Mask coordinates in pixels
  const applyMask = options.applyMask && maskConfig.enabled;
  const irisCx = (maskConfig.irisCenterX / 100) * width;
  const irisCy = (maskConfig.irisCenterY / 100) * height;
  const irisR = (maskConfig.irisRadius / 100) * Math.min(width, height);
  const pupilCx = (maskConfig.pupilCenterX / 100) * width;
  const pupilCy = (maskConfig.pupilCenterY / 100) * height;
  const pupilR = (maskConfig.pupilRadius / 100) * Math.min(width, height);
  const feather = Math.max(1, (maskConfig.feather / 100) * Math.min(width, height) * 0.2);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    let a = data[i + 3];

    if (a === 0) continue;

    const pixelIdx = i / 4;
    const px = pixelIdx % width;
    const py = Math.floor(pixelIdx / width);

    // If mask is enabled, calculate opacity based on iris boundary
    if (applyMask) {
      const distFromIrisCenter = Math.hypot(px - irisCx, py - irisCy);
      if (distFromIrisCenter > irisR + feather) {
        data[i + 3] = 0; // Completely outside iris
        continue;
      } else if (distFromIrisCenter > irisR - feather) {
        // Feather transition
        const alphaFactor = 1 - (distFromIrisCenter - (irisR - feather)) / (2 * feather);
        a = Math.round(a * Math.max(0, Math.min(1, alphaFactor)));
      }
    }

    // 1. Exposure & Brightness
    r = r * exposureFactor + brightnessOffset;
    g = g * exposureFactor + brightnessOffset;
    b = b * exposureFactor + brightnessOffset;

    // 2. Contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // 3. Colour Temperature (Amber vs Blue)
    if (tempShift > 0) {
      r += tempShift * 28;
      g += tempShift * 8;
      b -= tempShift * 22;
    } else if (tempShift < 0) {
      const absShift = -tempShift;
      b += absShift * 30;
      g += absShift * 5;
      r -= absShift * 20;
    }

    // Clamp before HSL operations
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // 4. Saturation and Targeted Iris Pigment Tone Adjustments (Brown & Green)
    if (satFactor !== 1 || brownShift !== 0 || greenShift !== 0) {
      let [h, s, l] = rgbToHsl(r, g, b);
      s = Math.max(0, Math.min(1, s * satFactor));

      // Brown / Amber tone adjustment (melanin range: 15° to 50°)
      if (brownShift !== 0 && h >= 15 && h <= 55 && s > 0.1) {
        s = Math.max(0, Math.min(1, s * (1 + brownShift * 0.4)));
        l = Math.max(0, Math.min(1, l + brownShift * 0.12));
      }

      // Green tint adjustment (hazel / green range: 60° to 160°)
      if (greenShift !== 0 && h >= 60 && h <= 160 && s > 0.1) {
        s = Math.max(0, Math.min(1, s * (1 + greenShift * 0.45)));
        l = Math.max(0, Math.min(1, l + greenShift * 0.08));
      }

      [r, g, b] = hslToRgb(h, s, l);
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
    data[i + 3] = a;
  }

  // 5. Sharpness (Unsharp Mask filter)
  if (adjustments.sharpness > 0) {
    const sharpnessAmount = (adjustments.sharpness / 100) * 0.8;
    applyConvolutionSharpen(data, width, height, sharpnessAmount);
  }

  tempCtx.putImageData(imgData, 0, 0);

  // If mask is enabled, keep deep velvety pupil centered and natural
  if (applyMask) {
    // Softly blend pupil center so camera flash inside the pupil remains a natural black void
    tempCtx.save();
    tempCtx.beginPath();
    tempCtx.arc(pupilCx, pupilCy, pupilR, 0, Math.PI * 2);
    const pupilGrad = tempCtx.createRadialGradient(pupilCx, pupilCy, 0, pupilCx, pupilCy, pupilR);
    pupilGrad.addColorStop(0, 'rgba(4, 5, 8, 0.96)');
    pupilGrad.addColorStop(0.85, 'rgba(4, 5, 8, 0.85)');
    pupilGrad.addColorStop(1, 'rgba(4, 5, 8, 0)');
    tempCtx.fillStyle = pupilGrad;
    tempCtx.fill();
    tempCtx.restore();
  }

  // Draw final processed image onto target canvas
  ctx.drawImage(tempCanvas, 0, 0);
}

/**
 * 3x3 Convolution Sharpening
 */
function applyConvolutionSharpen(data: Uint8ClampedArray, w: number, h: number, amount: number) {
  const copy = new Uint8ClampedArray(data);
  const centerWeight = 1 + 4 * amount;
  const edgeWeight = -amount;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] === 0) continue; // skip transparent

      for (let c = 0; c < 3; c++) {
        const top = copy[((y - 1) * w + x) * 4 + c];
        const bottom = copy[((y + 1) * w + x) * 4 + c];
        const left = copy[(y * w + (x - 1)) * 4 + c];
        const right = copy[(y * w + (x + 1)) * 4 + c];
        const center = copy[idx + c];

        const val = center * centerWeight + (top + bottom + left + right) * edgeWeight;
        data[idx + c] = Math.max(0, Math.min(255, val));
      }
    }
  }
}

/**
 * Simulated AI Glare Reduction & Micro-Detail Enhancement
 * Browser-based high-fidelity simulation of neural glare removal & micro-contrast
 */
export async function generateSimulatedAiEnhancement(
  sourceImage: HTMLImageElement,
  onProgress?: (step: number, label: string) => void
): Promise<string> {
  const width = sourceImage.naturalWidth || sourceImage.width || 1024;
  const height = sourceImage.naturalHeight || sourceImage.height || 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create canvas context');

  // Step 1
  onProgress?.(15, 'Preparing neural tensor proxy and analyzing stromal density...');
  await new Promise(r => setTimeout(r, 450));

  ctx.drawImage(sourceImage, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Step 2
  onProgress?.(40, 'Detecting corneal flash reflection & specular glare hotspots...');
  await new Promise(r => setTimeout(r, 600));

  // Glare reduction pass:
  // Identify hot specular highlights (luminance > 220) and softly attenuate them
  // by blending with local chromatic tone to reveal underlying iris texture
  const copy = new Uint8ClampedArray(data);
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const idx = (y * width + x) * 4;
      const r = copy[idx];
      const g = copy[idx + 1];
      const b = copy[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Detect harsh white flash reflection (specular glare)
      if (lum > 215) {
        // Sample neighboring pixels 4 steps away to get stromal color
        let sampleR = 0, sampleG = 0, sampleB = 0, count = 0;
        const offsets = [-3, 3];
        for (const dy of offsets) {
          for (const dx of offsets) {
            const sIdx = ((y + dy) * width + (x + dx)) * 4;
            const sLum = 0.299 * copy[sIdx] + 0.587 * copy[sIdx + 1] + 0.114 * copy[sIdx + 2];
            if (sLum < 200) {
              sampleR += copy[sIdx];
              sampleG += copy[sIdx + 1];
              sampleB += copy[sIdx + 2];
              count++;
            }
          }
        }

        if (count > 0) {
          const blend = Math.min(0.65, (lum - 215) / 40);
          data[idx] = Math.round(r * (1 - blend) + (sampleR / count) * blend);
          data[idx + 1] = Math.round(g * (1 - blend) + (sampleG / count) * blend);
          data[idx + 2] = Math.round(b * (1 - blend) + (sampleB / count) * blend);
        }
      }
    }
  }

  // Step 3
  onProgress?.(70, 'Enhancing micro-contrast & collarette fibrous definition...');
  await new Promise(r => setTimeout(r, 650));

  // Micro-contrast boost on fibers
  applyConvolutionSharpen(data, width, height, 0.45);

  // Boost iris saturation and vibrancy subtly
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    let [h, s, l] = rgbToHsl(r, g, b);
    
    // Richer texture
    s = Math.min(1, s * 1.15);
    l = Math.max(0, Math.min(1, (l - 0.5) * 1.12 + 0.5));
    [r, g, b] = hslToRgb(h, s, l);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imgData, 0, 0);

  // Step 4
  onProgress?.(95, 'Synthesizing simulated AI preview output...');
  await new Promise(r => setTimeout(r, 400));

  onProgress?.(100, 'Processing complete');
  return canvas.toDataURL('image/png', 0.95);
}

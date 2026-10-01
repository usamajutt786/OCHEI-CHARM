import { EffectSettings, IrisImage } from '../types';
import { renderProcessedImage } from './imageProcessing';

export interface RenderEffectOptions {
  width: number;
  height: number;
}

/**
 * Procedural starfield generator with seeded deterministic positions
 */
function drawStarfield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  density: number,
  brightness: number
) {
  const count = Math.round(180 * (density / 50));
  const alphaBase = (brightness / 100);

  // Soft nebula background dust
  const nebulaGrad = ctx.createRadialGradient(
    width * 0.45, height * 0.5, width * 0.1,
    width * 0.5, height * 0.5, width * 0.65
  );
  nebulaGrad.addColorStop(0, `rgba(45, 27, 85, ${0.28 * alphaBase})`);
  nebulaGrad.addColorStop(0.5, `rgba(18, 32, 68, ${0.18 * alphaBase})`);
  nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = nebulaGrad;
  ctx.fillRect(0, 0, width, height);

  // Draw stars
  for (let i = 0; i < count; i++) {
    // Pseudo-random deterministic
    const x = ((Math.sin(i * 991.1) + 1) / 2) * width;
    const y = ((Math.cos(i * 773.3) + 1) / 2) * height;
    const r = (Math.sin(i * 331.7) + 1.2) * 1.1;
    const starAlpha = (0.25 + 0.75 * ((Math.sin(i * 557.9) + 1) / 2)) * alphaBase;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240, 245, 255, ${starAlpha})`;
    ctx.fill();

    // Occasional star flare
    if (i % 18 === 0) {
      ctx.strokeStyle = `rgba(210, 230, 255, ${starAlpha * 0.5})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - r * 3, y);
      ctx.lineTo(x + r * 3, y);
      ctx.moveTo(x, y - r * 3);
      ctx.lineTo(x, y + r * 3);
      ctx.stroke();
    }
  }
}

/**
 * Draw crystalline shards exploding outward from iris boundary
 */
function drawCrystalShards(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  glowColor: string,
  intensity: number
) {
  const shardCount = 36;
  const factor = intensity / 50;

  ctx.save();
  for (let i = 0; i < shardCount; i++) {
    const angle = (i / shardCount) * Math.PI * 2 + (Math.sin(i) * 0.15);
    const dist = radius * (1.02 + ((Math.sin(i * 13) + 1) / 2) * 0.45 * factor);
    const shardLen = (18 + ((Math.cos(i * 29) + 1) / 2) * 45) * factor;
    const shardWidth = 4 + Math.sin(i * 7) * 3;

    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    const ex = cx + Math.cos(angle) * (dist + shardLen);
    const ey = cy + Math.sin(angle) * (dist + shardLen);

    // Tangent offsets for diamond/shard polygon
    const perpAngle = angle + Math.PI / 2;
    const mx = cx + Math.cos(angle) * (dist + shardLen * 0.4);
    const my = cy + Math.sin(angle) * (dist + shardLen * 0.4);

    const px1 = mx + Math.cos(perpAngle) * shardWidth;
    const py1 = my + Math.sin(perpAngle) * shardWidth;
    const px2 = mx - Math.cos(perpAngle) * shardWidth;
    const py2 = my - Math.sin(perpAngle) * shardWidth;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(px1, py1);
    ctx.lineTo(ex, ey);
    ctx.lineTo(px2, py2);
    ctx.closePath();

    ctx.fillStyle = `rgba(255, 255, 255, ${0.35 * factor})`;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10 * factor;
    ctx.fill();
    ctx.stroke();

    // Floating stardust flecks
    const fx = cx + Math.cos(angle + 0.05) * (dist + shardLen * 1.3);
    const fy = cy + Math.sin(angle + 0.05) * (dist + shardLen * 1.3);
    ctx.beginPath();
    ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Master Effect Composition Renderer
 */
export async function renderArtisticEffect(
  primaryImgElement: HTMLImageElement,
  primaryIris: IrisImage,
  secondaryImgElement: HTMLImageElement | null,
  secondaryIris: IrisImage | null,
  settings: EffectSettings,
  targetCanvas: HTMLCanvasElement,
  options: RenderEffectOptions
): Promise<void> {
  const { width, height } = options;
  targetCanvas.width = width;
  targetCanvas.height = height;

  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // 1. Draw Background
  if (settings.bgStyle === 'pure_black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  } else if (settings.bgStyle === 'deep_navy') {
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  // 2. Stars / Cosmic dust if enabled
  if (settings.showStars && settings.bgStyle !== 'transparent') {
    drawStarfield(ctx, width, height, 50, settings.starBrightness);
  }

  // Helper to render an isolated iris into an offscreen canvas
  const renderIsolatedCanvas = (
    imgEl: HTMLImageElement,
    irisData: IrisImage,
    targetSize: number
  ): HTMLCanvasElement => {
    const offCanvas = document.createElement('canvas');
    renderProcessedImage(
      imgEl,
      offCanvas,
      irisData.adjustments,
      irisData.maskConfig,
      {
        width: targetSize,
        height: targetSize,
        applyMask: true,
        background: 'transparent',
      }
    );
    return offCanvas;
  };

  const centerRefX = width / 2 + settings.posX;
  const centerRefY = height / 2 + settings.posY;
  const baseDim = Math.min(width, height);
  const glowAlpha = settings.glowIntensity / 100;

  // Determine which is left / right or primary / secondary based on swapPositions
  let irisA_img = primaryImgElement;
  let irisA_data = primaryIris;
  let irisB_img = secondaryImgElement || primaryImgElement;
  let irisB_data = secondaryIris || primaryIris;

  if (settings.swapPositions) {
    irisA_img = secondaryImgElement || primaryImgElement;
    irisA_data = secondaryIris || primaryIris;
    irisB_img = primaryImgElement;
    irisB_data = primaryIris;
  }

  switch (settings.preset) {
    case 'isolated': {
      // Single centered iris with pristine framing and optional atmospheric halo
      const irisSize = baseDim * 0.72 * settings.irisScale;
      const isolated = renderIsolatedCanvas(primaryImgElement, primaryIris, irisSize);

      // Atmospheric outer glow
      if (settings.glowIntensity > 0) {
        ctx.save();
        const rad = irisSize / 2;
        const glowGrad = ctx.createRadialGradient(
          centerRefX, centerRefY, rad * 0.88,
          centerRefX, centerRefY, rad * 1.35
        );
        glowGrad.addColorStop(0, settings.glowColor);
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalAlpha = glowAlpha * 0.7;
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(centerRefX, centerRefY, rad * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw primary isolated iris
      ctx.drawImage(isolated, centerRefX - irisSize / 2, centerRefY - irisSize / 2);
      break;
    }

    case 'diagonal_duo': {
      // Two irises positioned along a 45-degree elegant diagonal axis
      const irisSize = baseDim * 0.52 * settings.irisScale;
      const offDist = (settings.dualDistance / 2) * (baseDim / 1000);

      // Top-Left Iris
      const pos1X = centerRefX - offDist * 0.8;
      const pos1Y = centerRefY - offDist * 0.8;
      const isolated1 = renderIsolatedCanvas(irisA_img, irisA_data, irisSize);

      // Bottom-Right Iris
      const pos2X = centerRefX + offDist * 0.8;
      const pos2Y = centerRefY + offDist * 0.8;
      const isolated2 = renderIsolatedCanvas(irisB_img, irisB_data, irisSize);

      // Connection energy aura
      if (settings.glowIntensity > 0) {
        ctx.save();
        ctx.globalAlpha = glowAlpha * 0.5;
        const bridgeGrad = ctx.createLinearGradient(pos1X, pos1Y, pos2X, pos2Y);
        bridgeGrad.addColorStop(0, settings.glowColor);
        bridgeGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        bridgeGrad.addColorStop(1, settings.glowColor);
        ctx.strokeStyle = bridgeGrad;
        ctx.lineWidth = 2 * (settings.glowIntensity / 40);
        ctx.shadowColor = settings.glowColor;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(pos1X, pos1Y);
        ctx.lineTo(pos2X, pos2Y);
        ctx.stroke();
        ctx.restore();
      }

      // Draw irises
      ctx.drawImage(isolated1, pos1X - irisSize / 2, pos1Y - irisSize / 2);
      ctx.drawImage(isolated2, pos2X - irisSize / 2, pos2Y - irisSize / 2);
      break;
    }

    case 'infinity': {
      // Overlapping dual irises horizontally intertwined
      const irisSize = baseDim * 0.55 * settings.irisScale;
      const separation = (settings.dualDistance / 2) * (baseDim / 1000) * 0.75;

      const pos1X = centerRefX - separation;
      const pos2X = centerRefX + separation;
      const posY = centerRefY;

      const isolated1 = renderIsolatedCanvas(irisA_img, irisA_data, irisSize);
      const isolated2 = renderIsolatedCanvas(irisB_img, irisB_data, irisSize);

      // Infinity aura glow
      if (settings.glowIntensity > 0) {
        ctx.save();
        ctx.globalAlpha = glowAlpha * 0.6;
        ctx.shadowColor = settings.glowColor;
        ctx.shadowBlur = 24;
        ctx.strokeStyle = settings.glowColor;
        ctx.lineWidth = 3;
        
        // Draw elegant figure-8 curve
        ctx.beginPath();
        ctx.ellipse(pos1X, posY, irisSize * 0.58, irisSize * 0.58, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(pos2X, posY, irisSize * 0.58, irisSize * 0.58, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw both with slight overlap blend
      ctx.save();
      ctx.drawImage(isolated1, pos1X - irisSize / 2, posY - irisSize / 2);
      ctx.drawImage(isolated2, pos2X - irisSize / 2, posY - irisSize / 2);
      ctx.restore();
      break;
    }

    case 'shards': {
      // Single iris surrounded by radiating crystal shards and stardust
      const irisSize = baseDim * 0.64 * settings.irisScale;
      const isolated = renderIsolatedCanvas(primaryImgElement, primaryIris, irisSize);
      const irisR = irisSize * 0.44;

      // Draw crystal shards behind and radiating from iris
      drawCrystalShards(ctx, centerRefX, centerRefY, irisR, settings.glowColor, settings.glowIntensity);

      // Draw iris
      ctx.drawImage(isolated, centerRefX - irisSize / 2, centerRefY - irisSize / 2);
      break;
    }

    case 'lunar_stars': {
      // Lunar celestial ring with orbital luminous glow
      const irisSize = baseDim * 0.66 * settings.irisScale;
      const isolated = renderIsolatedCanvas(primaryImgElement, primaryIris, irisSize);
      const irisR = irisSize * 0.45;

      // Draw celestial moon rings
      ctx.save();
      ctx.shadowColor = settings.glowColor;
      ctx.shadowBlur = 25 * glowAlpha;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = settings.glowColor;
      ctx.globalAlpha = glowAlpha * 0.85;

      // Ring 1
      ctx.beginPath();
      ctx.arc(centerRefX, centerRefY, irisR * 1.12, 0, Math.PI * 2);
      ctx.stroke();

      // Ring 2 (dashed outer orbital)
      ctx.setLineDash([4, 12]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerRefX, centerRefY, irisR * 1.32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw iris
      ctx.drawImage(isolated, centerRefX - irisSize / 2, centerRefY - irisSize / 2);
      break;
    }
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { EffectSettings, EffectPreset, IrisImage } from '../../types';
import { renderArtisticEffect } from '../../services/effectsRenderer';
import { 
  Sparkles, 
  Layers, 
  X, 
  Check, 
  RotateCcw, 
  Download, 
  Moon, 
  Zap, 
  Sliders, 
  ArrowLeftRight,
  Sun,
  Grid
} from 'lucide-react';

interface EffectsModalProps {
  isOpen: boolean;
  primaryIris: IrisImage;
  availableImages: IrisImage[];
  onClose: () => void;
  onApplyAndExport?: (canvas: HTMLCanvasElement) => void;
}

const PRESET_OPTIONS: { id: EffectPreset; name: string; description: string; requiresDual: boolean }[] = [
  {
    id: 'isolated',
    name: 'Clean Isolated Iris',
    description: 'Pitch void backdrop with pure limbal boundary and subtle atmospheric rim halo.',
    requiresDual: false,
  },
  {
    id: 'diagonal_duo',
    name: 'Diagonal Duo Composition',
    description: 'Two complementary irises floating along a fine-art diagonal axis, ideal for couple portraits.',
    requiresDual: true,
  },
  {
    id: 'infinity',
    name: 'Infinity Twin Overlap',
    description: 'Intertwined twin irises with overlapping cosmic gradient bridge in an infinity form.',
    requiresDual: true,
  },
  {
    id: 'shards',
    name: 'Shards & Stardust Explosion',
    description: 'Geometric crystalline shards and stardust radiating outward from the limbal edge.',
    requiresDual: false,
  },
  {
    id: 'lunar_stars',
    name: 'Lunar Glow & Starfield',
    description: 'Celestial moon halo with realistic starry nebula backdrop and orbital cosmic rings.',
    requiresDual: false,
  },
];

const GLOW_COLORS = [
  { name: 'Amethyst Violet', hex: '#8b5cf6' },
  { name: 'Cerulean Cyan', hex: '#38bdf8' },
  { name: 'Solar Amber', hex: '#fbbf24' },
  { name: 'Emerald Jade', hex: '#34d399' },
  { name: 'Rose Quartz', hex: '#f43f5e' },
  { name: 'Lunar Silver', hex: '#e2e8f0' },
];

export const EffectsModal: React.FC<EffectsModalProps> = ({
  isOpen,
  primaryIris,
  availableImages,
  onClose,
  onApplyAndExport,
}) => {
  // Effect Settings State
  const [settings, setSettings] = useState<EffectSettings>({
    preset: 'lunar_stars',
    secondIrisId: availableImages.find(img => img.id !== primaryIris.id)?.id,
    irisScale: 1.0,
    posX: 0,
    posY: 0,
    dualDistance: 320,
    swapPositions: false,
    glowColor: '#8b5cf6',
    glowIntensity: 45,
    showStars: true,
    starBrightness: 70,
    bgStyle: 'pure_black',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const primaryImgRef = useRef<HTMLImageElement | null>(null);
  const secondaryImgRef = useRef<HTMLImageElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Selected secondary iris data
  const secondaryIris = availableImages.find(img => img.id === settings.secondIrisId) || null;

  // Load primary image
  useEffect(() => {
    if (!isOpen) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = primaryIris.isEnhanced && primaryIris.enhancedUrl ? primaryIris.enhancedUrl : primaryIris.originalUrl;
    img.onload = () => {
      primaryImgRef.current = img;
      triggerRender();
    };
  }, [isOpen, primaryIris.id, primaryIris.isEnhanced]);

  // Load secondary image if needed
  useEffect(() => {
    if (!isOpen || !secondaryIris) {
      secondaryImgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = secondaryIris.isEnhanced && secondaryIris.enhancedUrl ? secondaryIris.enhancedUrl : secondaryIris.originalUrl;
    img.onload = () => {
      secondaryImgRef.current = img;
      triggerRender();
    };
  }, [isOpen, secondaryIris?.id, secondaryIris?.isEnhanced]);

  // Re-render effect whenever settings change
  const triggerRender = async () => {
    if (!canvasRef.current || !primaryImgRef.current) return;
    setIsRendering(true);

    try {
      await renderArtisticEffect(
        primaryImgRef.current,
        primaryIris,
        secondaryImgRef.current,
        secondaryIris,
        settings,
        canvasRef.current,
        { width: 1400, height: 1400 }
      );
    } catch (e) {
      console.error('Failed to render artistic effect:', e);
    } finally {
      setIsRendering(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      triggerRender();
    }
  }, [settings, isOpen]);

  // Quick download directly from effects modal
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `iris-artwork-${settings.preset}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 0.95);
    link.click();
  };

  if (!isOpen) return null;

  const currentPresetMeta = PRESET_OPTIONS.find(p => p.id === settings.preset);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-6xl h-[92vh] bg-[#0c111d] border border-slate-800 rounded-3xl shadow-2xl flex flex-col text-slate-100 overflow-hidden"
        role="dialog"
      >
        {/* Header */}
        <div className="p-4 md:px-6 md:py-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0e1424]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-display">Fine Art Composition Studio</h3>
              <p className="text-xs text-slate-400">
                Preset layouts, dual-iris couple portraits, celestial stars & particle bursts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Artwork</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Preset Selector */}
          <div className="w-full md:w-72 bg-[#090d16] border-r border-slate-800/80 p-4 overflow-y-auto space-y-3 shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Composition Presets
            </span>

            <div className="space-y-2">
              {PRESET_OPTIONS.map((preset) => {
                const isSelected = settings.preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSettings(s => ({ ...s, preset: preset.id }))}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-violet-950/40 border-violet-500 shadow-md ring-1 ring-violet-500/30'
                        : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {preset.name}
                      </span>
                      {preset.requiresDual && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium">
                          Dual Iris
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center: Live Artwork Canvas Preview */}
          <div className="flex-1 bg-[#060912] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-800/80 aspect-square max-h-[80%] max-w-[80%] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-contain block ${
                  settings.bgStyle === 'transparent' ? 'bg-transparency-pattern' : 'bg-black'
                }`}
              />

              {isRendering && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                    <span>Rendering artwork...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Tag */}
            <div className="absolute bottom-4 left-6 text-xs text-slate-400 flex items-center gap-2">
              <span className="font-semibold text-slate-300">{currentPresetMeta?.name}</span>
              <span>·</span>
              <span className="font-mono-data text-[11px] text-slate-500">1400×1400 Fine Art Print Canvas</span>
            </div>
          </div>

          {/* Right: Fine-Tuning Controls */}
          <div className="w-full md:w-80 bg-[#090d16] border-l border-slate-800/80 p-4 overflow-y-auto space-y-5 shrink-0 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-violet-400" />
                <span>Composition Controls</span>
              </span>
              <button
                onClick={() => setSettings({
                  preset: settings.preset,
                  secondIrisId: availableImages.find(img => img.id !== primaryIris.id)?.id,
                  irisScale: 1.0,
                  posX: 0,
                  posY: 0,
                  dualDistance: 320,
                  swapPositions: false,
                  glowColor: '#8b5cf6',
                  glowIntensity: 45,
                  showStars: true,
                  starBrightness: 70,
                  bgStyle: 'pure_black',
                })}
                className="text-[11px] text-slate-500 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Dual Iris Selection if required */}
            {currentPresetMeta?.requiresDual && (
              <div className="space-y-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Secondary Iris Selection
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {availableImages.map((img) => {
                    const isSelected = settings.secondIrisId === img.id;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, secondIrisId: img.id }))}
                        className={`relative rounded-xl overflow-hidden aspect-square border transition-all ${
                          isSelected
                            ? 'border-violet-500 ring-2 ring-violet-500/40'
                            : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                        title={img.name}
                      >
                        <img 
                          src={img.originalUrl} 
                          alt={img.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 p-0.5 rounded-full bg-violet-600 text-white">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Swap Positions:</span>
                  <button
                    onClick={() => setSettings(s => ({ ...s, swapPositions: !s.swapPositions }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                      settings.swapPositions
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Swap Left/Right</span>
                  </button>
                </div>

                {/* Distance slider for dual iris */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Separation Distance</span>
                    <span className="font-mono-data text-white">{settings.dualDistance}px</span>
                  </div>
                  <input
                    type="range"
                    min={120}
                    max={520}
                    value={settings.dualDistance}
                    onChange={(e) => setSettings(s => ({ ...s, dualDistance: parseInt(e.target.value, 10) }))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              </div>
            )}

            {/* Scale and Positioning */}
            <div className="space-y-3">
              <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider block">
                Scale & Offset
              </span>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Iris Diameter Scale</span>
                  <span className="font-mono-data text-white">{Math.round(settings.irisScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={1.5}
                  step={0.02}
                  value={settings.irisScale}
                  onChange={(e) => setSettings(s => ({ ...s, irisScale: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Horizontal Offset (X)</span>
                  <span className="font-mono-data text-white">{settings.posX}px</span>
                </div>
                <input
                  type="range"
                  min={-150}
                  max={150}
                  value={settings.posX}
                  onChange={(e) => setSettings(s => ({ ...s, posX: parseInt(e.target.value, 10) }))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Vertical Offset (Y)</span>
                  <span className="font-mono-data text-white">{settings.posY}px</span>
                </div>
                <input
                  type="range"
                  min={-150}
                  max={150}
                  value={settings.posY}
                  onChange={(e) => setSettings(s => ({ ...s, posY: parseInt(e.target.value, 10) }))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>
            </div>

            {/* Aura & Glow Settings */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider block">
                Atmospheric Glow Aura
              </span>

              {/* Color swatches */}
              <div className="flex items-center gap-2">
                {GLOW_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => setSettings(s => ({ ...s, glowColor: col.hex }))}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      settings.glowColor === col.hex ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>

              {/* Glow Intensity */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Glow Intensity</span>
                  <span className="font-mono-data text-white">{settings.glowIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.glowIntensity}
                  onChange={(e) => setSettings(s => ({ ...s, glowIntensity: parseInt(e.target.value, 10) }))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>
            </div>

            {/* Stars & Canvas Backdrop */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider block">
                Cosmic Backdrop & Stars
              </span>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-300">Deep Starfield Layer</span>
                <input
                  type="checkbox"
                  checked={settings.showStars}
                  onChange={(e) => setSettings(s => ({ ...s, showStars: e.target.checked }))}
                  className="w-4 h-4 rounded text-violet-600 bg-slate-950 border-slate-700"
                />
              </div>

              {settings.showStars && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Star Brightness & Density</span>
                    <span className="font-mono-data text-white">{settings.starBrightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    value={settings.starBrightness}
                    onChange={(e) => setSettings(s => ({ ...s, starBrightness: parseInt(e.target.value, 10) }))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              )}

              {/* Background style options */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['pure_black', 'deep_navy', 'transparent'] as const).map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setSettings(s => ({ ...s, bgStyle: bg }))}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-medium border capitalize transition-colors text-center ${
                      settings.bgStyle === bg
                        ? 'bg-violet-950/50 border-violet-500 text-white'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {bg.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

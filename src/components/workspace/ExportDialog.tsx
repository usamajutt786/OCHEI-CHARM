import React, { useState, useEffect, useRef } from 'react';
import { IrisImage } from '../../types';
import { renderProcessedImage } from '../../services/imageProcessing';
import { 
  Download, 
  X, 
  Check, 
  Image as ImageIcon, 
  Info, 
  Maximize, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface ExportDialogProps {
  isOpen: boolean;
  image: IrisImage | null;
  onClose: () => void;
  onDownloaded: (filename: string) => void;
}

const DIMENSION_PRESETS = [
  { label: 'Square Fine Art Print', width: 2048, height: 2048, ratio: '1:1', desc: 'Gallery wall art & framing' },
  { label: 'Social Square', width: 1080, height: 1080, ratio: '1:1', desc: 'Instagram & mobile viewing' },
  { label: 'Ultra-HD Master', width: 3000, height: 3000, ratio: '1:1', desc: 'Large format archival print' },
  { label: 'Widescreen Display', width: 2560, height: 1440, ratio: '16:9', desc: 'Desktop 2K/4K display' },
];

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  image,
  onClose,
  onDownloaded,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [isTransparent, setIsTransparent] = useState(false);
  const [jpegQuality, setJpegQuality] = useState(92);
  const [filename, setFilename] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (image) {
      const cleanName = image.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      setFilename(`iris-${cleanName}-${new Date().toISOString().slice(0, 10)}`);
    }
  }, [image]);

  // Render preview canvas
  useEffect(() => {
    if (!isOpen || !image || !previewCanvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image.isEnhanced && image.enhancedUrl ? image.enhancedUrl : image.originalUrl;
    img.onload = () => {
      if (!previewCanvasRef.current) return;
      const targetPreset = DIMENSION_PRESETS[selectedPresetIdx];
      
      // Render preview scaled to 600px for speed
      renderProcessedImage(
        img,
        previewCanvasRef.current,
        image.adjustments,
        image.maskConfig,
        {
          width: 600,
          height: Math.round(600 * (targetPreset.height / targetPreset.width)),
          applyMask: image.maskConfig.enabled,
          background: isTransparent && format === 'png' ? 'transparent' : 'pure_black',
        }
      );
    };
  }, [isOpen, image, selectedPresetIdx, isTransparent, format]);

  const handleExportDownload = async () => {
    if (!image) return;
    setIsGenerating(true);

    try {
      const preset = DIMENSION_PRESETS[selectedPresetIdx];
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = preset.width;
      exportCanvas.height = preset.height;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = image.isEnhanced && image.enhancedUrl ? image.enhancedUrl : image.originalUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      renderProcessedImage(
        img,
        exportCanvas,
        image.adjustments,
        image.maskConfig,
        {
          width: preset.width,
          height: preset.height,
          applyMask: image.maskConfig.enabled,
          background: isTransparent && format === 'png' ? 'transparent' : 'pure_black',
        }
      );

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const quality = format === 'jpeg' ? jpegQuality / 100 : undefined;
      const dataUrl = exportCanvas.toDataURL(mimeType, quality);

      const fullFilename = `${filename.trim() || 'iris-artwork'}.${format}`;
      const link = document.createElement('a');
      link.download = fullFilename;
      link.href = dataUrl;
      link.click();

      onDownloaded(fullFilename);
      onClose();
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !image) return null;

  const currentPreset = DIMENSION_PRESETS[selectedPresetIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0f1523] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#111828]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-display">Export Master Artwork</h3>
              <p className="text-xs text-slate-400">Render fine-art resolution image with applied adjustments</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Preview */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300 block">Render Preview</span>
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-square flex items-center justify-center shadow-lg">
                <canvas 
                  ref={previewCanvasRef} 
                  className={`w-full h-full object-contain block ${
                    isTransparent && format === 'png' ? 'bg-transparency-pattern' : 'bg-black'
                  }`}
                />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] text-slate-300 font-mono-data">
                  {currentPreset.width}×{currentPreset.height} px
                </div>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="space-y-4">
              {/* File Name */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  File Name
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500 font-mono-data"
                  />
                  <span className="text-slate-500 font-mono-data text-xs">.{format}</span>
                </div>
              </div>

              {/* Format selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('png')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      format === 'png'
                        ? 'bg-violet-950/40 border-violet-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="font-semibold">PNG</p>
                    <p className="text-[10px] text-slate-500">Lossless · Alpha channel</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormat('jpeg');
                      setIsTransparent(false);
                    }}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      format === 'jpeg'
                        ? 'bg-violet-950/40 border-violet-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="font-semibold">JPEG</p>
                    <p className="text-[10px] text-slate-500">High compatibility</p>
                  </button>
                </div>
              </div>

              {/* Transparency Toggle (PNG only) */}
              {format === 'png' && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-slate-200 font-medium block">Transparent Background</span>
                    <span className="text-[10px] text-slate-500">Export isolated iris with transparent alpha</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isTransparent}
                    onChange={(e) => setIsTransparent(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 bg-slate-950 border-slate-700"
                  />
                </div>
              )}

              {/* JPEG Quality Slider */}
              {format === 'jpeg' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>JPEG Quality</span>
                    <span className="font-mono-data text-white">{jpegQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={100}
                    value={jpegQuality}
                    onChange={(e) => setJpegQuality(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              )}

              {/* Resolution Presets */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Resolution Preset
                </label>
                <div className="space-y-1.5">
                  {DIMENSION_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSelectedPresetIdx(idx)}
                      className={`w-full text-left p-2 rounded-xl border flex items-center justify-between transition-all ${
                        selectedPresetIdx === idx
                          ? 'bg-violet-950/30 border-violet-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-xs text-white">{preset.label}</p>
                        <p className="text-[10px] text-slate-500">{preset.desc}</p>
                      </div>
                      <span className="font-mono-data text-[11px] text-violet-300">
                        {preset.width}×{preset.height}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Note on Resolution */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Artwork renders at physical pixel dimensions using full-fidelity Canvas interpolations. Note: higher canvas dimensions preserve applied geometric filters and effects, but cannot reconstruct camera optical focus beyond original sensor resolution.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-slate-400 text-xs">
            Target Size: <span className="font-mono-data text-white">{currentPreset.width}×{currentPreset.height} px</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExportDownload}
              disabled={isGenerating}
              className="px-5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-lg shadow-violet-900/30 flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Rendering...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

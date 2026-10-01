import React, { useState, useEffect } from 'react';
import { IrisImage } from '../../types';
import { generateSimulatedAiEnhancement } from '../../services/imageProcessing';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Layers, 
  ArrowRight,
  SplitSquareVertical,
  RotateCcw
} from 'lucide-react';

interface AiEnhanceModalProps {
  isOpen: boolean;
  image: IrisImage | null;
  onClose: () => void;
  onApplyEnhanced: (enhancedDataUrl: string) => void;
}

export const AiEnhanceModal: React.FC<AiEnhanceModalProps> = ({
  isOpen,
  image,
  onClose,
  onApplyEnhanced,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing simulated AI pipeline...');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [showCompareSlider, setShowCompareSlider] = useState(true);
  const [sliderPos, setSliderPos] = useState(50);

  useEffect(() => {
    if (isOpen && image) {
      runEnhancement();
    } else {
      setPreviewDataUrl(null);
      setProgress(0);
      setIsProcessing(false);
    }
  }, [isOpen, image?.id]);

  const runEnhancement = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Preparing image tensor proxy and analyzing stromal density...');

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = image.originalUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const result = await generateSimulatedAiEnhancement(img, (percent, label) => {
        setProgress(percent);
        setStatusMessage(label);
      });

      setPreviewDataUrl(result);
      setIsProcessing(false);
    } catch (err) {
      console.error('Enhancement error:', err);
      setIsProcessing(false);
      setStatusMessage('Enhancement failed. Please try again.');
    }
  };

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold font-display">Simulated AI Glare Reduction</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-900/40 text-violet-300 border border-violet-700/50">
                  Client Preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Corneal specular attenuation & micro-crypt sharpening for {image.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* Progress State or Comparison Preview */}
          {isProcessing ? (
            <div className="py-16 px-6 text-center max-w-md mx-auto space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" 
                />
                <Sparkles className="w-6 h-6 text-violet-400 absolute inset-0 m-auto" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">{statusMessage}</p>
                <div className="w-full bg-slate-900 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono-data mt-1 block">
                  {progress}% Complete
                </span>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Simulating specular reflection suppression and edge convolution...
              </p>
            </div>
          ) : previewDataUrl ? (
            <div className="space-y-4">
              {/* Interactive Draggable Split Preview inside Modal */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-square max-h-[380px] mx-auto shadow-2xl select-none">
                {/* Background: Original photo */}
                <img
                  src={image.originalUrl}
                  alt="Original"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover block"
                />

                {/* Foreground: Enhanced photo clipped */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={previewDataUrl}
                    alt="Enhanced"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover block max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>

                {/* Slider divider */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-lg"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-md">
                    ⮜⮞
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-semibold text-violet-300 pointer-events-none">
                  Simulated AI Preview
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-semibold text-slate-300 pointer-events-none">
                  Original Photo
                </div>
              </div>

              {/* Slider position scrubber control */}
              <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
                <span className="text-[11px]">Drag divider or adjust comparison slider:</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPos}
                  onChange={(e) => setSliderPos(parseInt(e.target.value, 10))}
                  className="w-48 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <span className="font-mono-data text-[11px] w-8 text-right">{sliderPos}%</span>
              </div>
            </div>
          ) : null}

          {/* Technical Disclosure Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <Info className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span>About Simulated AI vs. Production Neural Pipeline</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This preview applies client-side luminance suppression to attenuate corneal flash hot spots and boost radial micro-contrast. In the upcoming production deployment, an asynchronous Replicate pipeline will utilize specialized generative models to synthesize genuine hidden stromal details.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={runEnhancement}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-run Simulation</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (previewDataUrl) {
                  onApplyEnhanced(previewDataUrl);
                  onClose();
                }
              }}
              disabled={!previewDataUrl || isProcessing}
              className="px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Apply to Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

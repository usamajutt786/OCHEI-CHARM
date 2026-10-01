import React, { useRef, useEffect, useState } from 'react';
import { IrisImage, User } from '../../types';
import { renderProcessedImage } from '../../services/imageProcessing';
import { Printer, X, Check, Image as ImageIcon } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  image: IrisImage | null;
  currentUser: User | null;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  image,
  currentUser,
  onClose,
}) => {
  const printCanvasRef = useRef<HTMLCanvasElement>(null);
  const [mattingColor, setMattingColor] = useState<'museum_black' | 'gallery_white'>('museum_black');
  const [showMetadata, setShowMetadata] = useState(true);

  useEffect(() => {
    if (!isOpen || !image || !printCanvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image.isEnhanced && image.enhancedUrl ? image.enhancedUrl : image.originalUrl;
    img.onload = () => {
      if (!printCanvasRef.current) return;
      renderProcessedImage(
        img,
        printCanvasRef.current,
        image.adjustments,
        image.maskConfig,
        {
          width: 1200,
          height: 1200,
          applyMask: image.maskConfig.enabled,
          background: 'pure_black',
        }
      );
    };
  }, [isOpen, image]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="p-4 md:px-6 md:py-4 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold font-display">Fine Art Gallery Print</h3>
              <p className="text-xs text-slate-400">Archival matting layout & printer preparation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Print Preview Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-[#070a12]">
          {/* Framed Matting Container */}
          <div 
            id="print-framing-area"
            className={`p-10 md:p-14 rounded-2xl shadow-2xl transition-all max-w-md w-full flex flex-col items-center ${
              mattingColor === 'museum_black'
                ? 'bg-[#000000] text-slate-300 border border-slate-800'
                : 'bg-[#fafafa] text-slate-900 border border-slate-300'
            }`}
          >
            {/* Artwork Canvas */}
            <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl bg-black flex items-center justify-center">
              <canvas
                ref={printCanvasRef}
                className="w-full h-full object-contain block"
              />
            </div>

            {/* Matting Editorial Inscription */}
            {showMetadata && (
              <div className="mt-6 text-center">
                <p className={`text-sm font-semibold tracking-wide font-display ${
                  mattingColor === 'museum_black' ? 'text-white' : 'text-slate-900'
                }`}>
                  {image.name}
                </p>
                <div className={`flex items-center justify-center gap-2 text-xs mt-1 ${
                  mattingColor === 'museum_black' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <span>Iris Studio Edition</span>
                  <span>·</span>
                  <span>{currentUser?.name || 'Studio Artist'}</span>
                  <span>·</span>
                  <span className="font-mono-data">{new Date().getFullYear()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer & Controls (hidden in print) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Matting:</span>
              <button
                type="button"
                onClick={() => setMattingColor('museum_black')}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  mattingColor === 'museum_black'
                    ? 'bg-slate-900 text-white border-violet-500'
                    : 'text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Museum Black
              </button>
              <button
                type="button"
                onClick={() => setMattingColor('gallery_white')}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  mattingColor === 'gallery_white'
                    ? 'bg-slate-900 text-white border-violet-500'
                    : 'text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Gallery White
              </button>
            </div>

            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showMetadata}
                onChange={(e) => setShowMetadata(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-violet-600 bg-slate-900 border-slate-700"
              />
              <span>Include Caption</span>
            </label>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Artwork</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

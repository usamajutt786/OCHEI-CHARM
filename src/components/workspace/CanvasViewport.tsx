import React, { useRef, useEffect, useState, useCallback } from 'react';
import { IrisImage } from '../../types';
import { renderProcessedImage } from '../../services/imageProcessing';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCw, 
  Grid, 
  SplitSquareVertical, 
  Columns, 
  Eye, 
  Sparkles,
  Move,
  Upload
} from 'lucide-react';

interface CanvasViewportProps {
  currentImage: IrisImage | null;
  onUploadClick: () => void;
  onSelectSample: (sampleId: string) => void;
  samples: IrisImage[];
  isMaskGuideActive: boolean;
  onUpdateMask: (updates: Partial<IrisImage['maskConfig']>) => void;
  isAiEnhanced: boolean;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  currentImage,
  onUploadClick,
  onSelectSample,
  samples,
  isMaskGuideActive,
  onUpdateMask,
  isAiEnhanced,
}) => {
  // Zoom & Canvas Transform
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Background style
  const [showCheckerboard, setShowCheckerboard] = useState(true);

  // Comparison Modes: 'none' | 'slider' (draggable divider) | 'side_by_side' | 'hold'
  const [compareMode, setCompareMode] = useState<'none' | 'slider' | 'side_by_side'>('none');
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100 %
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);

  // Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Load image element
  useEffect(() => {
    if (!currentImage) {
      loadedImageRef.current = null;
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage.isEnhanced && currentImage.enhancedUrl 
      ? currentImage.enhancedUrl 
      : currentImage.originalUrl;
    
    img.onload = () => {
      loadedImageRef.current = img;
      renderCanvases();
    };
  }, [currentImage?.id, currentImage?.isEnhanced, currentImage?.enhancedUrl, currentImage?.originalUrl]);

  // Render processed canvases
  const renderCanvases = useCallback(() => {
    if (!currentImage || !loadedImageRef.current || !mainCanvasRef.current) return;

    // Render Main Processed Canvas
    renderProcessedImage(
      loadedImageRef.current,
      mainCanvasRef.current,
      currentImage.adjustments,
      currentImage.maskConfig,
      {
        applyMask: currentImage.maskConfig.enabled,
        background: showCheckerboard ? 'transparent' : 'pure_black',
      }
    );

    // If comparison active, render raw original canvas
    if (originalCanvasRef.current && (compareMode === 'slider' || compareMode === 'side_by_side')) {
      const origImg = new Image();
      origImg.crossOrigin = 'anonymous';
      origImg.src = currentImage.originalUrl;
      origImg.onload = () => {
        if (!originalCanvasRef.current) return;
        const origCtx = originalCanvasRef.current.getContext('2d');
        if (!origCtx) return;
        originalCanvasRef.current.width = origImg.naturalWidth || 1024;
        originalCanvasRef.current.height = origImg.naturalHeight || 1024;
        origCtx.drawImage(origImg, 0, 0);
      };
    }
  }, [currentImage, showCheckerboard, compareMode]);

  // Re-render whenever adjustments, mask, or display options change
  useEffect(() => {
    renderCanvases();
  }, [renderCanvases, currentImage?.adjustments, currentImage?.maskConfig, showCheckerboard]);

  // Reset zoom & pan on image change
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  }, [currentImage?.id]);

  // Handle Pan Events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggingSlider) return;
    if (e.button === 0) { // Left click pan
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pos = ((e.clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(5, Math.min(95, pos)));
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingSlider(false);
  };

  // Keyboard shortcut: Spacebar hold to compare original
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsHoldingOriginal(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsHoldingOriginal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Fit to Screen Handler
  const handleFitToScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div 
      className="flex-1 flex flex-col bg-[#070b12] relative overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Floating Viewport Control Bar */}
      {currentImage && (
        <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Left Context: Comparison & Transparency Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0e1422]/90 backdrop-blur-md border border-slate-800/90 rounded-xl shadow-xl pointer-events-auto text-xs">
            <button
              onClick={() => setCompareMode(compareMode === 'slider' ? 'none' : 'slider')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                compareMode === 'slider'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Interactive Draggable Split Slider Comparison"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split Slider</span>
            </button>

            <button
              onClick={() => setCompareMode(compareMode === 'side_by_side' ? 'none' : 'side_by_side')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                compareMode === 'side_by_side'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Side by Side Original vs Processed"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Side by Side</span>
            </button>

            <button
              onMouseDown={() => setIsHoldingOriginal(true)}
              onMouseUp={() => setIsHoldingOriginal(false)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 ${
                isHoldingOriginal ? 'bg-amber-600/30 text-amber-300' : ''
              }`}
              title="Hold to preview unadjusted original photo (or hold Spacebar)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Hold Original</span>
            </button>

            <div className="w-[1px] h-4 bg-slate-800 mx-1" />

            <button
              onClick={() => setShowCheckerboard(!showCheckerboard)}
              className={`p-1.5 rounded-lg transition-colors ${
                showCheckerboard ? 'bg-slate-800 text-violet-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle transparency checkerboard vs solid black void"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Context: Zoom, Pan, Rotation */}
          <div className="flex items-center gap-1 p-1 bg-[#0e1422]/90 backdrop-blur-md border border-slate-800/90 rounded-xl shadow-xl pointer-events-auto text-xs">
            <button
              onClick={() => setZoom(z => Math.max(0.25, z - 0.15))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="w-12 text-center font-mono-data text-slate-300 text-[11px]">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={() => setZoom(z => Math.min(3.5, z + 0.15))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleFitToScreen}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Viewport Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-6 cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
      >
        {currentImage ? (
          <div 
            className="relative flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              maxWidth: '90%',
              maxHeight: '90%',
            }}
          >
            {/* Split Slider Comparison Mode */}
            {compareMode === 'slider' ? (
              <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-800">
                {/* Background: Original photo */}
                <canvas 
                  ref={originalCanvasRef} 
                  className="max-w-[70vw] max-h-[75vh] object-contain block"
                />

                {/* Foreground: Processed photo clipped by slider */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <canvas
                    ref={mainCanvasRef}
                    className={`max-w-[70vw] max-h-[75vh] object-contain block ${
                      showCheckerboard ? 'bg-transparency-pattern' : 'bg-black'
                    }`}
                  />
                </div>

                {/* Draggable Divider Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-30 shadow-lg flex items-center justify-center"
                  style={{ left: `${sliderPosition}%` }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingSlider(true);
                  }}
                >
                  <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xl border-2 border-white select-none">
                    ⮜⮞
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-violet-300 pointer-events-none">
                  Processed Result
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-slate-300 pointer-events-none">
                  Original Photo
                </div>
              </div>
            ) : compareMode === 'side_by_side' ? (
              /* Side-by-Side Comparison Mode */
              <div className="flex items-center gap-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-slate-300 z-10">
                    Original
                  </div>
                  <canvas 
                    ref={originalCanvasRef} 
                    className="max-w-[36vw] max-h-[70vh] object-contain block bg-black"
                  />
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-violet-700/50 shadow-2xl">
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-violet-300 z-10">
                    Processed {currentImage.isEnhanced && '· AI Enhanced'}
                  </div>
                  <canvas 
                    ref={mainCanvasRef} 
                    className={`max-w-[36vw] max-h-[70vh] object-contain block ${
                      showCheckerboard ? 'bg-transparency-pattern' : 'bg-black'
                    }`}
                  />
                </div>
              </div>
            ) : (
              /* Standard Single Canvas Mode */
              <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-800/80">
                {/* Hold to compare: switch source display */}
                {isHoldingOriginal ? (
                  <img
                    src={currentImage.originalUrl}
                    alt="Original raw"
                    className="max-w-[75vw] max-h-[80vh] object-contain block"
                  />
                ) : (
                  <canvas
                    ref={mainCanvasRef}
                    className={`max-w-[75vw] max-h-[80vh] object-contain block ${
                      showCheckerboard ? 'bg-transparency-pattern' : 'bg-black'
                    }`}
                  />
                )}

                {/* Mask overlay visual indicators when mask guide is active */}
                {isMaskGuideActive && currentImage.maskConfig.enabled && !isHoldingOriginal && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Outer Iris Limbal Guide Ring */}
                    <div 
                      className="absolute rounded-full border-2 border-dashed border-violet-400/80 shadow-sm"
                      style={{
                        width: `${currentImage.maskConfig.irisRadius * 2}%`,
                        height: `${currentImage.maskConfig.irisRadius * 2}%`,
                        left: `${currentImage.maskConfig.irisCenterX - currentImage.maskConfig.irisRadius}%`,
                        top: `${currentImage.maskConfig.irisCenterY - currentImage.maskConfig.irisRadius}%`,
                      }}
                    >
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-violet-900/90 text-[9px] font-mono text-violet-200 uppercase">
                        Iris Boundary
                      </span>
                    </div>

                    {/* Inner Pupil Guide Ring */}
                    <div 
                      className="absolute rounded-full border-2 border-sky-400/90 shadow-sm"
                      style={{
                        width: `${currentImage.maskConfig.pupilRadius * 2}%`,
                        height: `${currentImage.maskConfig.pupilRadius * 2}%`,
                        left: `${currentImage.maskConfig.pupilCenterX - currentImage.maskConfig.pupilRadius}%`,
                        top: `${currentImage.maskConfig.pupilCenterY - currentImage.maskConfig.pupilRadius}%`,
                      }}
                    >
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-sky-900/90 text-[9px] font-mono text-sky-200 uppercase">
                        Pupil Center
                      </span>
                    </div>
                  </div>
                )}

                {isHoldingOriginal && (
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-amber-500/90 text-black text-xs font-bold shadow-lg">
                    Previewing Original Photo
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty State: Upload or Select Sample */
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0e1422] border border-slate-800 text-center shadow-2xl animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4 text-violet-400">
              <Upload className="w-7 h-7" />
            </div>
            
            <h3 className="text-base font-semibold text-white font-display mb-1.5">
              Select or Upload an Iris Photograph
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Import a high-resolution macro eye photograph (JPEG or PNG) or immediately explore with our studio fine art samples.
            </p>

            <button
              onClick={onUploadClick}
              className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-violet-900/30 transition-all flex items-center justify-center gap-2 mb-4"
            >
              <Upload className="w-4 h-4" />
              <span>Choose Photo to Upload</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-slate-800" />
              <span className="absolute bg-[#0e1422] px-3 text-[11px] text-slate-500 uppercase tracking-wider">
                Or pick a studio sample
              </span>
            </div>

            {/* Quick 1-click sample choices */}
            <div className="grid grid-cols-2 gap-2.5 text-left">
              {samples.slice(0, 4).map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample.id)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-violet-500/50 flex items-center gap-2.5 transition-all group"
                >
                  <img
                    src={sample.originalUrl}
                    alt={sample.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 pr-1">
                    <p className="text-xs font-medium text-slate-200 truncate group-hover:text-violet-300">
                      {sample.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">Macro Studio</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Simulated AI active indicator badge */}
      {currentImage?.isEnhanced && (
        <div className="absolute bottom-3 left-4 z-10 px-3 py-1 rounded-lg bg-violet-950/80 border border-violet-700/50 backdrop-blur-md flex items-center gap-2 text-xs text-violet-300 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Simulated AI preview applied</span>
        </div>
      )}
    </div>
  );
};

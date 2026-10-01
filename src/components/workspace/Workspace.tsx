import React, { useState, useCallback, useRef } from 'react';
import { IrisImage, AdjustmentValues, IrisMaskConfig, User } from '../../types';
import { DEFAULT_ADJUSTMENTS } from '../../services/sampleData';
import { ImageStrip } from './ImageStrip';
import { CanvasViewport } from './CanvasViewport';
import { AdjustmentPanel } from './AdjustmentPanel';
import { AiEnhanceModal } from './AiEnhanceModal';
import { EffectsModal } from '../effects/EffectsModal';
import { ExportDialog } from './ExportDialog';
import { PrintModal } from './PrintModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { AlertCircle, X, FileQuestion } from 'lucide-react';

interface WorkspaceProps {
  images: IrisImage[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onAddImage: (newImg: IrisImage) => void;
  onDeleteImage: (id: string) => void;
  onUpdateImageAdjustments: (id: string, adjustments: AdjustmentValues) => void;
  onUpdateImageMask: (id: string, maskConfig: IrisMaskConfig) => void;
  onApplyEnhancedImage: (id: string, enhancedUrl: string) => void;
  currentUser: User | null;
  onNotify: (type: 'success' | 'info' | 'warning' | 'error', title: string, message?: string) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isEffectsModalOpen: boolean;
  setIsEffectsModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isPrintModalOpen: boolean;
  setIsPrintModalOpen: (open: boolean) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  images,
  selectedImageId,
  onSelectImage,
  onAddImage,
  onDeleteImage,
  onUpdateImageAdjustments,
  onUpdateImageMask,
  onApplyEnhancedImage,
  currentUser,
  onNotify,
  isAiModalOpen,
  setIsAiModalOpen,
  isEffectsModalOpen,
  setIsEffectsModalOpen,
  isExportModalOpen,
  setIsExportModalOpen,
  isPrintModalOpen,
  setIsPrintModalOpen,
}) => {
  const currentImage = images.find(img => img.id === selectedImageId) || null;

  // Mask guide display toggle
  const [isMaskGuideActive, setIsMaskGuideActive] = useState(false);

  // Undo / Redo history stack
  const [history, setHistory] = useState<{ [id: string]: AdjustmentValues[] }>({});
  const [historyIndex, setHistoryIndex] = useState<{ [id: string]: number }>({});

  // RAW file dialog
  const [rawWarningFile, setRawWarningFile] = useState<string | null>(null);

  // Delete confirm
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  // Reset adjustments confirm
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Current adjustments and mask config
  const currentAdjustments = currentImage?.adjustments || DEFAULT_ADJUSTMENTS;
  const currentMaskConfig = currentImage?.maskConfig || {
    enabled: true,
    irisCenterX: 50,
    irisCenterY: 50,
    irisRadius: 38,
    pupilCenterX: 50,
    pupilCenterY: 50,
    pupilRadius: 13,
    feather: 4,
  };

  // Check if modified from defaults
  const hasModifications = currentImage ? (
    Object.keys(DEFAULT_ADJUSTMENTS).some(
      key => currentAdjustments[key as keyof AdjustmentValues] !== 0
    ) || currentImage.isEnhanced
  ) : false;

  // History helper
  const pushHistory = useCallback((imgId: string, newAdjustments: AdjustmentValues) => {
    setHistory(prev => {
      const imgHistory = prev[imgId] || [DEFAULT_ADJUSTMENTS];
      const curIdx = historyIndex[imgId] !== undefined ? historyIndex[imgId] : imgHistory.length - 1;
      const updated = [...imgHistory.slice(0, curIdx + 1), newAdjustments];
      return { ...prev, [imgId]: updated };
    });
    setHistoryIndex(prev => {
      const imgHistory = history[imgId] || [DEFAULT_ADJUSTMENTS];
      const curIdx = prev[imgId] !== undefined ? prev[imgId] : imgHistory.length - 1;
      return { ...prev, [imgId]: curIdx + 1 };
    });
  }, [history, historyIndex]);

  const handleUpdateAdjustment = (key: keyof AdjustmentValues, value: number) => {
    if (!currentImage) return;
    const updated = {
      ...currentAdjustments,
      [key]: value,
    };
    onUpdateImageAdjustments(currentImage.id, updated);
    pushHistory(currentImage.id, updated);
  };

  const handleResetAdjustment = (key: keyof AdjustmentValues) => {
    if (!currentImage) return;
    const updated = {
      ...currentAdjustments,
      [key]: 0,
    };
    onUpdateImageAdjustments(currentImage.id, updated);
    pushHistory(currentImage.id, updated);
  };

  const handleResetAllAdjustments = () => {
    if (!currentImage) return;
    onUpdateImageAdjustments(currentImage.id, { ...DEFAULT_ADJUSTMENTS });
    pushHistory(currentImage.id, { ...DEFAULT_ADJUSTMENTS });
    onNotify('info', 'Adjustments reset', 'Restored default tone and color values.');
  };

  const handleUpdateMask = (updates: Partial<IrisMaskConfig>) => {
    if (!currentImage) return;
    const updated = {
      ...currentMaskConfig,
      ...updates,
    };
    onUpdateImageMask(currentImage.id, updated);
  };

  // Undo / Redo
  const canUndo = currentImage ? ((historyIndex[currentImage.id] || 0) > 0) : false;
  const canRedo = currentImage ? (
    (historyIndex[currentImage.id] !== undefined) &&
    (historyIndex[currentImage.id] < ((history[currentImage.id] || []).length - 1))
  ) : false;

  const handleUndo = () => {
    if (!currentImage || !canUndo) return;
    const curIdx = historyIndex[currentImage.id] || 0;
    const nextIdx = curIdx - 1;
    const targetState = history[currentImage.id][nextIdx];
    if (targetState) {
      setHistoryIndex(prev => ({ ...prev, [currentImage.id]: nextIdx }));
      onUpdateImageAdjustments(currentImage.id, targetState);
    }
  };

  const handleRedo = () => {
    if (!currentImage || !canRedo) return;
    const curIdx = historyIndex[currentImage.id] || 0;
    const nextIdx = curIdx + 1;
    const targetState = history[currentImage.id][nextIdx];
    if (targetState) {
      setHistoryIndex(prev => ({ ...prev, [currentImage.id]: nextIdx }));
      onUpdateImageAdjustments(currentImage.id, targetState);
    }
  };

  // Upload handler
  const handleUploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const newIris: IrisImage = {
          id: `img-${Date.now().toString(36)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          originalUrl: dataUrl,
          isEnhanced: false,
          uploadedAt: new Date().toISOString(),
          width: img.naturalWidth || 1024,
          height: img.naturalHeight || 1024,
          adjustments: { ...DEFAULT_ADJUSTMENTS },
          maskConfig: {
            enabled: true,
            irisCenterX: 50,
            irisCenterY: 50,
            irisRadius: 38,
            pupilCenterX: 50,
            pupilCenterY: 50,
            pupilRadius: 13,
            feather: 4,
          },
        };
        onAddImage(newIris);
        onNotify('success', 'Photo imported', `Loaded ${file.name} (${img.naturalWidth}×${img.naturalHeight}px)`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // RAW file attempt notice
  const handleRawFileAttempt = (filename: string) => {
    setRawWarningFile(filename);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#070a12] relative">
      {/* Left: Thumbnail Reel */}
      <ImageStrip
        images={images}
        selectedImageId={selectedImageId}
        onSelectImage={onSelectImage}
        onDeleteImage={(id) => setImageToDelete(id)}
        onUploadFile={handleUploadFile}
        onRawFileAttempt={handleRawFileAttempt}
      />

      {/* Center: Canvas Viewport */}
      <CanvasViewport
        currentImage={currentImage}
        onUploadClick={() => {
          const input = document.querySelector('input[type="file"]') as HTMLInputElement;
          input?.click();
        }}
        onSelectSample={onSelectImage}
        samples={images.filter(i => i.isSample)}
        isMaskGuideActive={isMaskGuideActive}
        onUpdateMask={handleUpdateMask}
        isAiEnhanced={currentImage?.isEnhanced || false}
      />

      {/* Right: Adjustments and Mask Panel */}
      <AdjustmentPanel
        currentImage={currentImage}
        adjustments={currentAdjustments}
        maskConfig={currentMaskConfig}
        onUpdateAdjustment={handleUpdateAdjustment}
        onResetAdjustment={handleResetAdjustment}
        onResetAllAdjustments={() => setIsResetConfirmOpen(true)}
        onUpdateMask={handleUpdateMask}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        hasModifications={hasModifications}
        isMaskGuideActive={isMaskGuideActive}
        onToggleMaskGuide={() => setIsMaskGuideActive(!isMaskGuideActive)}
        onOpenAiEnhanceModal={() => setIsAiModalOpen(true)}
      />

      {/* Simulated AI Enhancement Modal */}
      {isAiModalOpen && (
        <AiEnhanceModal
          isOpen={isAiModalOpen}
          image={currentImage}
          onClose={() => setIsAiModalOpen(false)}
          onApplyEnhanced={(enhancedUrl) => {
            if (currentImage) {
              onApplyEnhancedImage(currentImage.id, enhancedUrl);
              onNotify('success', 'AI Enhancement Applied', 'Simulated glare reduction and stromal sharpening active.');
            }
          }}
        />
      )}

      {/* Effects Workspace Studio Modal */}
      {isEffectsModalOpen && currentImage && (
        <EffectsModal
          isOpen={isEffectsModalOpen}
          primaryIris={currentImage}
          availableImages={images}
          onClose={() => setIsEffectsModalOpen(false)}
        />
      )}

      {/* Export Dialog */}
      {isExportModalOpen && currentImage && (
        <ExportDialog
          isOpen={isExportModalOpen}
          image={currentImage}
          onClose={() => setIsExportModalOpen(false)}
          onDownloaded={(fname) => {
            onNotify('success', 'Export downloaded', `Saved ${fname} to downloads.`);
          }}
        />
      )}

      {/* Print Modal */}
      {isPrintModalOpen && currentImage && (
        <PrintModal
          isOpen={isPrintModalOpen}
          image={currentImage}
          currentUser={currentUser}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* RAW File Guard Dialog */}
      {rawWarningFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#111724] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">RAW Camera File Detected</h3>
                  <p className="text-xs text-slate-400 font-mono-data truncate max-w-xs">{rawWarningFile}</p>
                </div>
              </div>
              <button 
                onClick={() => setRawWarningFile(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Camera RAW formats (such as Canon .CR2, Nikon .NEF, Sony .ARW) require specialized optical sensor debayering. Please export your camera RAW file as a high-quality <strong>JPEG</strong> or lossless <strong>PNG</strong> in Lightroom, Photoshop, or your camera utility before importing into Iris Studio.
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setRawWarningFile(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Image Confirmation */}
      <ConfirmModal
        isOpen={!!imageToDelete}
        title="Remove Iris Photo"
        message="Are you sure you want to remove this iris photo from your workspace session?"
        confirmLabel="Remove Photo"
        isDestructive={true}
        onConfirm={() => {
          if (imageToDelete) {
            onDeleteImage(imageToDelete);
            setImageToDelete(null);
            onNotify('info', 'Photo removed', 'Asset removed from active reel.');
          }
        }}
        onCancel={() => setImageToDelete(null)}
      />

      {/* Reset Adjustments Confirmation */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset All Photo Adjustments"
        message="This will reset exposure, brightness, contrast, color temperature, and pigment tints back to default values."
        confirmLabel="Reset Adjustments"
        isDestructive={false}
        onConfirm={() => {
          handleResetAllAdjustments();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};

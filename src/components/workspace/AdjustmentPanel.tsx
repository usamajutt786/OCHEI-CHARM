import React, { useState } from 'react';
import { AdjustmentValues, IrisMaskConfig, IrisImage } from '../../types';
import { 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Sliders, 
  CircleDashed, 
  Info, 
  Sun, 
  Contrast, 
  Thermometer, 
  Sparkles, 
  Palette,
  Eye,
  Check
} from 'lucide-react';

interface AdjustmentPanelProps {
  currentImage: IrisImage | null;
  adjustments: AdjustmentValues;
  maskConfig: IrisMaskConfig;
  onUpdateAdjustment: (key: keyof AdjustmentValues, value: number) => void;
  onResetAdjustment: (key: keyof AdjustmentValues) => void;
  onResetAllAdjustments: () => void;
  onUpdateMask: (updates: Partial<IrisMaskConfig>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasModifications: boolean;
  isMaskGuideActive: boolean;
  onToggleMaskGuide: () => void;
  onOpenAiEnhanceModal: () => void;
}

export const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({
  currentImage,
  adjustments,
  maskConfig,
  onUpdateAdjustment,
  onResetAdjustment,
  onResetAllAdjustments,
  onUpdateMask,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasModifications,
  isMaskGuideActive,
  onToggleMaskGuide,
  onOpenAiEnhanceModal,
}) => {
  const [activeTab, setActiveTab] = useState<'adjustments' | 'isolation' | 'ai_info'>('adjustments');

  if (!currentImage) {
    return (
      <aside className="w-80 bg-[#0a0e18] border-l border-slate-800/80 flex flex-col justify-center items-center p-6 text-center text-slate-500 text-xs">
        <Sliders className="w-8 h-8 text-slate-600 mb-2" />
        <p className="font-medium text-slate-400">No Image Loaded</p>
        <p className="text-[11px] text-slate-600 mt-1">Select an iris photo from the reel to enable editing controls.</p>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-[#0a0e18] border-l border-slate-800/80 flex flex-col shrink-0 select-none text-slate-200">
      {/* Top Tabs */}
      <div className="border-b border-slate-800/80 p-2 flex items-center gap-1 bg-[#0b101c]">
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors text-center ${
            activeTab === 'adjustments'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Adjustments
        </button>

        <button
          onClick={() => setActiveTab('isolation')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors text-center ${
            activeTab === 'isolation'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Iris Isolation
        </button>

        <button
          onClick={() => setActiveTab('ai_info')}
          className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors text-center ${
            activeTab === 'ai_info'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="AI Processing Information"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* History and Global Status Bar */}
      <div className="px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between bg-[#080d16] text-xs">
        <div className="flex items-center gap-2">
          {hasModifications ? (
            <span className="flex items-center gap-1 text-[11px] text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Modifications applied</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Default settings</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 text-slate-400 hover:text-white disabled:text-slate-700 transition-colors rounded hover:bg-slate-800"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 text-slate-400 hover:text-white disabled:text-slate-700 transition-colors rounded hover:bg-slate-800"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-slate-800 mx-1" />

          <button
            onClick={onResetAllAdjustments}
            disabled={!hasModifications}
            className="text-[11px] text-slate-400 hover:text-white disabled:text-slate-700 transition-colors"
            title="Reset all adjustments back to default"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {activeTab === 'adjustments' && (
          <>
            {/* Tone & Exposure Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                  Tone & Exposure
                </span>
              </div>

              {/* Exposure */}
              <SliderRow
                label="Exposure"
                value={adjustments.exposure}
                min={-100}
                max={100}
                step={1}
                unit="EV"
                onChange={(val) => onUpdateAdjustment('exposure', val)}
                onReset={() => onResetAdjustment('exposure')}
              />

              {/* Brightness */}
              <SliderRow
                label="Brightness"
                value={adjustments.brightness}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onUpdateAdjustment('brightness', val)}
                onReset={() => onResetAdjustment('brightness')}
              />

              {/* Contrast */}
              <SliderRow
                label="Contrast"
                value={adjustments.contrast}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onUpdateAdjustment('contrast', val)}
                onReset={() => onResetAdjustment('contrast')}
              />
            </div>

            {/* Color & Pigment Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                  Color & Pigmentation
                </span>
              </div>

              {/* Saturation */}
              <SliderRow
                label="Saturation"
                value={adjustments.saturation}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onUpdateAdjustment('saturation', val)}
                onReset={() => onResetAdjustment('saturation')}
              />

              {/* Temperature */}
              <SliderRow
                label="Color Temperature"
                value={adjustments.temperature}
                min={-100}
                max={100}
                step={1}
                customDisplay={adjustments.temperature < 0 ? `${adjustments.temperature} Cool` : adjustments.temperature > 0 ? `+${adjustments.temperature} Warm` : '0'}
                onChange={(val) => onUpdateAdjustment('temperature', val)}
                onReset={() => onResetAdjustment('temperature')}
              />

              {/* Brown Melanin Adjustment */}
              <SliderRow
                label="Brown Iris Tone"
                value={adjustments.brownTone}
                min={-100}
                max={100}
                step={1}
                sublabel="Melanin warmth"
                onChange={(val) => onUpdateAdjustment('brownTone', val)}
                onReset={() => onResetAdjustment('brownTone')}
              />

              {/* Green Tint Adjustment */}
              <SliderRow
                label="Green Iris Tint"
                value={adjustments.greenTint}
                min={-100}
                max={100}
                step={1}
                sublabel="Hazel/jade pigment"
                onChange={(val) => onUpdateAdjustment('greenTint', val)}
                onReset={() => onResetAdjustment('greenTint')}
              />
            </div>

            {/* Detail & Sharpness Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                  Texture & Sharpness
                </span>
              </div>

              {/* Sharpness */}
              <SliderRow
                label="Sharpness"
                value={adjustments.sharpness}
                min={0}
                max={100}
                step={1}
                sublabel="Micro-contrast on crypts"
                onChange={(val) => onUpdateAdjustment('sharpness', val)}
                onReset={() => onResetAdjustment('sharpness')}
              />
            </div>

            {/* Quick AI Enhancement Trigger */}
            <div className="pt-2">
              <button
                onClick={onOpenAiEnhanceModal}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-violet-900/50 to-indigo-900/50 hover:from-violet-850 hover:to-indigo-850 border border-violet-700/60 rounded-xl text-violet-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md group"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
                <span>Simulate AI Glare Reduction</span>
              </button>
            </div>
          </>
        )}

        {/* Iris Isolation Tab */}
        {activeTab === 'isolation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="font-semibold text-white block">Circular Iris Masking</span>
                <span className="text-[11px] text-slate-400">Isolates iris from eyelids and sclera</span>
              </div>
              <input
                type="checkbox"
                checked={maskConfig.enabled}
                onChange={(e) => onUpdateMask({ enabled: e.target.checked })}
                className="w-4 h-4 rounded text-violet-600 bg-slate-950 border-slate-700 focus:ring-violet-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="font-semibold text-white block">Viewport Guide Rings</span>
                <span className="text-[11px] text-slate-400">Shows alignment circles on canvas</span>
              </div>
              <button
                onClick={onToggleMaskGuide}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isMaskGuideActive
                    ? 'bg-violet-600 text-white border-violet-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {isMaskGuideActive ? 'Visible' : 'Hidden'}
              </button>
            </div>

            {/* Iris Limbal Controls */}
            <div className="space-y-3 pt-2">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] block">
                Limbal Ring (Outer Iris)
              </span>

              <SliderRow
                label="Iris Radius / Size"
                value={maskConfig.irisRadius}
                min={15}
                max={55}
                step={0.5}
                onChange={(val) => onUpdateMask({ irisRadius: val })}
              />

              <SliderRow
                label="Center X Offset"
                value={maskConfig.irisCenterX}
                min={30}
                max={70}
                step={0.5}
                onChange={(val) => onUpdateMask({ irisCenterX: val })}
              />

              <SliderRow
                label="Center Y Offset"
                value={maskConfig.irisCenterY}
                min={30}
                max={70}
                step={0.5}
                onChange={(val) => onUpdateMask({ irisCenterY: val })}
              />

              <SliderRow
                label="Edge Feathering"
                value={maskConfig.feather}
                min={0}
                max={25}
                step={1}
                unit="px"
                onChange={(val) => onUpdateMask({ feather: val })}
              />
            </div>

            {/* Pupil Controls */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] block">
                Pupil Center & Aperture
              </span>

              <SliderRow
                label="Pupil Radius"
                value={maskConfig.pupilRadius}
                min={4}
                max={28}
                step={0.5}
                onChange={(val) => onUpdateMask({ pupilRadius: val })}
              />

              <SliderRow
                label="Pupil Center X"
                value={maskConfig.pupilCenterX}
                min={35}
                max={65}
                step={0.5}
                onChange={(val) => onUpdateMask({ pupilCenterX: val })}
              />

              <SliderRow
                label="Pupil Center Y"
                value={maskConfig.pupilCenterY}
                min={35}
                max={65}
                step={0.5}
                onChange={(val) => onUpdateMask({ pupilCenterY: val })}
              />
            </div>
          </div>
        )}

        {/* AI Information Tab */}
        {activeTab === 'ai_info' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-400">
            <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-800/40 text-violet-200">
              <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Simulated AI Glare Reduction</span>
              </h4>
              <p className="text-[11px] text-violet-300/90 leading-relaxed">
                This client-side simulation applies algorithmic specular highlight suppression, localized luminance smoothing, and micro-contrast enhancement across iris crypts.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h5 className="font-medium text-slate-200">Production AI Roadmap</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The future production environment will connect to Replicate's server-side neural models to perform deep generative glare removal.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Real flash glare obscures physical iris fibers; the client prototype demonstrates simulated reconstruction without claiming genuine neural texture recovery.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-500">
              Status: Client Canvas Pipeline Active · Replicate API Stubbed Cleanly
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

interface SliderRowProps {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  customDisplay?: string;
  onChange: (value: number) => void;
  onReset?: () => void;
}

const SliderRow: React.FC<SliderRowProps> = ({
  label,
  sublabel,
  value,
  min,
  max,
  step = 1,
  unit = '',
  customDisplay,
  onChange,
  onReset,
}) => {
  const isModified = value !== 0 && value !== min && value !== 50;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 font-medium">{label}</span>
          {sublabel && <span className="text-[10px] text-slate-500">({sublabel})</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono-data text-[11px] text-slate-300">
            {customDisplay || (value > 0 && min < 0 ? `+${value}${unit}` : `${value}${unit}`)}
          </span>
          {onReset && isModified && (
            <button
              onClick={onReset}
              className="text-[10px] text-slate-500 hover:text-violet-400 transition-colors p-0.5"
              title="Reset this setting"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400 focus:outline-none"
      />
    </div>
  );
};

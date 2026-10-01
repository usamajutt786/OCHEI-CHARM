import React, { useRef } from 'react';
import { IrisImage } from '../../types';
import { Upload, Trash2, Eye, Sparkles, Image as ImageIcon, Plus } from 'lucide-react';

interface ImageStripProps {
  images: IrisImage[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onDeleteImage: (id: string) => void;
  onUploadFile: (file: File) => void;
  onRawFileAttempt: (filename: string) => void;
}

export const ImageStrip: React.FC<ImageStripProps> = ({
  images,
  selectedImageId,
  onSelectImage,
  onDeleteImage,
  onUploadFile,
  onRawFileAttempt,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      const rawExtensions = ['raw', 'cr2', 'cr3', 'nef', 'arw', 'dng', 'raf', 'rw2', 'orf'];

      if (ext && rawExtensions.includes(ext)) {
        onRawFileAttempt(file.name);
        continue;
      }

      if (file.type.startsWith('image/')) {
        onUploadFile(file);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <aside className="w-64 bg-[#0a0e18] border-r border-slate-800/80 flex flex-col shrink-0 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-slate-200">Iris Photo Reel</h2>
          <p className="text-[11px] text-slate-500">{images.length} Loaded Assets</p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
          title="Upload Iris Photo"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium pr-1">Add</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,.raw,.cr2,.cr3,.nef,.arw,.dng"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Image List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {images.map((img) => {
          const isSelected = selectedImageId === img.id;
          return (
            <div
              key={img.id}
              onClick={() => onSelectImage(img.id)}
              className={`group relative p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-violet-950/30 border-violet-600/70 shadow-md shadow-violet-950/40 ring-1 ring-violet-500/40'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700/80'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-12 h-12 rounded-lg bg-black overflow-hidden shrink-0 border border-slate-800">
                <img
                  src={img.originalUrl}
                  alt={img.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {img.isEnhanced && (
                  <div className="absolute bottom-0 right-0 p-0.5 bg-violet-600 rounded-tl text-white">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pr-1">
                <p className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {img.name}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                  <span className="font-mono-data">{img.width}×{img.height}</span>
                  {img.isSample && (
                    <>
                      <span>·</span>
                      <span className="text-violet-400">Sample</span>
                    </>
                  )}
                  {img.eyeSide && img.eyeSide !== 'unknown' && (
                    <>
                      <span>·</span>
                      <span className="capitalize">{img.eyeSide} Eye</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteImage(img.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {/* Upload drop zone hint */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-slate-800 hover:border-violet-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950/30 hover:bg-slate-900/30"
        >
          <Upload className="w-4 h-4 text-slate-500 mx-auto mb-1.5" />
          <p className="text-[11px] font-medium text-slate-400">Import Iris Photo</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Drop JPEG or PNG files</p>
        </div>
      </div>
    </aside>
  );
};

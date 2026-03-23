'use client';

import { useRef, useState } from 'react';

interface VideoUploaderProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov'];
const MAX_SIZE_MB = 250;

export function VideoUploader({ onFileSelected, selectedFile, disabled }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|qt)$/i)) {
      return 'Unsupported format. Please upload an MP4, MOV, or WebM video.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  }

  function handleFile(file: File) {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onFileSelected(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const videoUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  return (
    <div className="space-y-3">
      {selectedFile && videoUrl ? (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-9/16 max-h-64 flex items-center justify-center">
          <video
            src={videoUrl}
            className="max-h-full max-w-full object-contain"
            controls
            muted
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => { setError(null); inputRef.current?.click(); }}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2.5 py-1 rounded-full transition-colors"
            >
              Change
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`w-full flex flex-col items-center justify-center gap-3 px-6 py-12 rounded-xl border-2 border-dashed transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed border-zinc-200 bg-zinc-50' : ''}
            ${!disabled && dragOver ? 'border-indigo-400 bg-indigo-50' : ''}
            ${!disabled && !dragOver ? 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer' : ''}
          `}
        >
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.868V19a1 1 0 01-1.447.894L15 17.999M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700">
              {dragOver ? 'Drop video here' : 'Click to upload or drag & drop'}
            </p>
            <p className="mt-1 text-xs text-zinc-400">MP4, MOV, WebM · up to {MAX_SIZE_MB}MB</p>
          </div>
        </button>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}

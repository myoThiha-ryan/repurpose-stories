import type { Platform } from '@/types';

interface PlatformSelectorProps {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
  instagramLinked: boolean;
}

const PLATFORMS: { id: Platform; label: string; icon: React.ReactNode }[] = [
  {
    id: 'instagram',
    label: 'Instagram Story',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook Story',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
];

export function PlatformSelector({ selected, onChange, instagramLinked }: PlatformSelectorProps) {
  function toggle(platform: Platform) {
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  }

  return (
    <div className="space-y-2">
      {PLATFORMS.map(({ id, label, icon }) => {
        const isChecked = selected.includes(id);
        const isDisabled = id === 'instagram' && !instagramLinked;

        return (
          <button
            key={id}
            type="button"
            disabled={isDisabled}
            onClick={() => toggle(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors
              ${isDisabled ? 'opacity-40 cursor-not-allowed bg-zinc-50 border-zinc-200' : 'cursor-pointer'}
              ${isChecked && !isDisabled
                ? 'border-indigo-400 bg-indigo-50'
                : !isDisabled
                ? 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                : ''}
            `}
          >
            <div className={`flex-shrink-0 ${id === 'instagram' ? 'text-pink-500' : 'text-blue-600'}`}>
              {icon}
            </div>
            <span className="flex-1 text-sm font-medium text-zinc-800">{label}</span>
            {isDisabled && (
              <span className="text-xs text-zinc-400">No Instagram account linked</span>
            )}
            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
              ${isChecked && !isDisabled ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-300 bg-white'}`}
            >
              {isChecked && !isDisabled && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

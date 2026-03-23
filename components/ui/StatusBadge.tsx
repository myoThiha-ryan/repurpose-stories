import type { PostStatus } from '@/types';

const CONFIG: Record<PostStatus, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-zinc-100 text-zinc-600' },
  uploading:  { label: 'Uploading',  className: 'bg-blue-50 text-blue-600' },
  processing: { label: 'Processing', className: 'bg-yellow-50 text-yellow-700' },
  publishing: { label: 'Publishing', className: 'bg-purple-50 text-purple-700' },
  success:    { label: 'Posted',     className: 'bg-green-50 text-green-700' },
  error:      { label: 'Failed',     className: 'bg-red-50 text-red-600' },
};

export function StatusBadge({ status }: { status: PostStatus }) {
  const { label, className } = CONFIG[status] ?? CONFIG.pending;
  const isActive = status === 'uploading' || status === 'processing' || status === 'publishing';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </span>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface AuthStatus {
  connected: boolean;
  expired?: boolean;
  pageName?: string;
  pageId?: string;
  instagramUsername?: string;
  instagramAccountId?: string;
}

export default function ConnectPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const errorParam = searchParams.get('error');

  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/status');
      const json = await res.json();
      if (json.success) setStatus(json.data as AuthStatus);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch('/api/auth/disconnect', { method: 'POST' });
      await fetchStatus();
    } finally {
      setDisconnecting(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Connect Accounts</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Link your Facebook Page and Instagram account to start posting stories.
          </p>
        </div>

        {/* Banner messages */}
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            Successfully connected your account!
          </div>
        )}
        {errorParam && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {decodeURIComponent(errorParam)}
          </div>
        )}

        {/* Connection card */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-1">
                {/* Facebook icon */}
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-white">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                {/* Instagram icon */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center ring-2 ring-white">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900">Facebook &amp; Instagram</h2>
                <p className="text-xs text-zinc-500">Via Facebook Graph API</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                Checking connection...
              </div>
            ) : status?.connected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-700">Connected</span>
                </div>
                <div className="rounded-lg bg-zinc-50 border border-zinc-100 px-4 py-3 space-y-1.5 text-sm">
                  {status.pageName && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Facebook Page</span>
                      <span className="font-medium text-zinc-800">{status.pageName}</span>
                    </div>
                  )}
                  {status.instagramUsername ? (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Instagram</span>
                      <span className="font-medium text-zinc-800">@{status.instagramUsername}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Instagram</span>
                      <span className="text-amber-600 text-xs">No linked account</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="w-full mt-2 py-2 px-4 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-300" />
                  <span className="text-sm text-zinc-500">
                    {status?.expired ? 'Token expired — reconnect to continue' : 'Not connected'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  You&apos;ll be redirected to Facebook to authorize access to your Page and Instagram account.
                </p>
                <a
                  href="/api/auth/facebook"
                  className="flex w-full items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Connect with Facebook
                </a>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100">
            <p className="text-xs text-zinc-400">
              Required permissions: <span className="font-mono">instagram_basic</span>,{' '}
              <span className="font-mono">instagram_content_publish</span>,{' '}
              <span className="font-mono">pages_show_list</span>,{' '}
              <span className="font-mono">pages_manage_posts</span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
            ← Back to upload
          </a>
        </div>
      </div>
    </div>
  );
}

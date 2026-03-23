'use client';

import { useEffect, useState, useCallback } from 'react';
import { VideoUploader } from '@/components/ui/VideoUploader';
import { PlatformSelector } from '@/components/ui/PlatformSelector';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UploadHistory } from '@/components/ui/UploadHistory';
import type { Platform, UploadRecord } from '@/types';

interface AuthStatus {
  connected: boolean;
  expired?: boolean;
  pageName?: string;
  instagramUsername?: string;
  instagramAccountId?: string;
}

type AppStep = 'idle' | 'uploading' | 'posting' | 'done' | 'error';

export default function HomePage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(['facebook']);

  const [step, setStep] = useState<AppStep>('idle');
  const [currentRecord, setCurrentRecord] = useState<UploadRecord | null>(null);
  const [postResults, setPostResults] = useState<{
    instagram?: { success: boolean; postId?: string; error?: string };
    facebook?: { success: boolean; postId?: string; error?: string };
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [history, setHistory] = useState<UploadRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status');
      const json = await res.json();
      if (json.success) setAuthStatus(json.data as AuthStatus);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history');
      const json = await res.json();
      if (json.success) setHistory(json.data as UploadRecord[]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthStatus();
    fetchHistory();
  }, [fetchAuthStatus, fetchHistory]);

  // When Instagram is not linked, remove it from selection
  useEffect(() => {
    if (authStatus && !authStatus.instagramAccountId) {
      setPlatforms((prev) => prev.filter((p) => p !== 'instagram'));
    }
  }, [authStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || !platforms.length) return;

    setStep('uploading');
    setErrorMsg(null);
    setPostResults(null);
    setCurrentRecord(null);

    // Step 1: Upload video
    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('platforms', JSON.stringify(platforms));

    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
    const uploadJson = await uploadRes.json();

    if (!uploadJson.success) {
      setStep('error');
      setErrorMsg(uploadJson.error ?? 'Upload failed');
      return;
    }

    const { id: uploadId, videoUrl } = uploadJson.data as { id: string; videoUrl: string };

    setStep('posting');

    // Step 2: Post to platforms
    const postRes = await fetch('/api/post-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId, platforms, videoUrl }),
    });
    const postJson = await postRes.json();

    if (!postJson.success) {
      setStep('error');
      setErrorMsg(postJson.error ?? 'Posting failed');
      await fetchHistory();
      return;
    }

    setPostResults(postJson.data);
    setStep('done');

    // Refresh history
    await fetchHistory();

    // Fetch final record
    const statusRes = await fetch(`/api/status/${uploadId}`);
    const statusJson = await statusRes.json();
    if (statusJson.success) setCurrentRecord(statusJson.data as UploadRecord);
  }

  function reset() {
    setStep('idle');
    setSelectedFile(null);
    setCurrentRecord(null);
    setPostResults(null);
    setErrorMsg(null);
  }

  const isProcessing = step === 'uploading' || step === 'posting';
  const canSubmit = !!selectedFile && platforms.length > 0 && !!authStatus?.connected && !isProcessing;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
              </svg>
            </div>
            <span className="font-semibold text-zinc-900">Repurpose Stories</span>
          </div>
          <a
            href="/connect"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            {authLoading ? (
              <span className="text-zinc-400">Checking...</span>
            ) : authStatus?.connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>
                  {authStatus.pageName ?? 'Connected'}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-zinc-300" />
                <span>Connect accounts</span>
              </>
            )}
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left panel — Upload form */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100">
                <h1 className="font-semibold text-zinc-900">Post to Stories</h1>
                <p className="text-xs text-zinc-500 mt-0.5">Upload a video and post it to Instagram & Facebook Stories</p>
              </div>

              {/* Not connected banner */}
              {!authLoading && !authStatus?.connected && (
                <div className="mx-6 mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
                  <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Account not connected</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      <a href="/connect" className="underline">Connect your Facebook & Instagram</a> before posting.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Video uploader */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-2">Video</label>
                  <VideoUploader
                    onFileSelected={setSelectedFile}
                    selectedFile={selectedFile}
                    disabled={isProcessing}
                  />
                </div>

                {/* Platform selector */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-2">Post to</label>
                  <PlatformSelector
                    selected={platforms}
                    onChange={setPlatforms}
                    instagramLinked={!!authStatus?.instagramAccountId}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {step === 'uploading' ? 'Uploading video...' : 'Posting to stories...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                      Post to Stories
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Result panel */}
            {(step === 'done' || step === 'error') && (
              <div className={`rounded-xl border shadow-sm overflow-hidden ${step === 'done' ? 'bg-white border-zinc-200' : 'bg-white border-red-200'}`}>
                <div className={`px-6 py-4 border-b ${step === 'done' ? 'border-zinc-100' : 'border-red-100'}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-zinc-900">
                      {step === 'done' ? 'Post Result' : 'Error'}
                    </h2>
                    {currentRecord && <StatusBadge status={currentRecord.status} />}
                  </div>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {step === 'error' && errorMsg && (
                    <p className="text-sm text-red-600">{errorMsg}</p>
                  )}
                  {step === 'done' && postResults && (
                    <div className="space-y-2">
                      {postResults.instagram !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-3.5 h-3.5 text-pink-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                          <span className="text-zinc-600">Instagram:</span>
                          {postResults.instagram.success ? (
                            <span className="text-green-700 font-medium">Posted successfully</span>
                          ) : (
                            <span className="text-red-600">{postResults.instagram.error}</span>
                          )}
                        </div>
                      )}
                      {postResults.facebook !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span className="text-zinc-600">Facebook:</span>
                          {postResults.facebook.success ? (
                            <span className="text-green-700 font-medium">Posted successfully</span>
                          ) : (
                            <span className="text-red-600">{postResults.facebook.error}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={reset}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Post another video
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right panel — History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900">Recent Posts</h2>
                <button
                  onClick={fetchHistory}
                  className="text-zinc-400 hover:text-zinc-700 transition-colors"
                  title="Refresh"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              </div>
              <div className="px-6 py-2">
                {historyLoading ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-sm text-zinc-400">
                    <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <UploadHistory records={history} />
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { invitationsApi } from '@/lib/api/invitations';
import { useAuthStore } from '@/store/auth';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link.');
      setStatus('error');
      return;
    }

    invitationsApi
      .acceptInvitation(token)
      .then((res) => {
        if ('requiresRegistration' in res && res.requiresRegistration) {
          router.replace(
            `/register?email=${encodeURIComponent(res.email)}&token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(`/boards/${res.boardId}`)}`
          );
        } else {
          router.replace(
            user
              ? `/boards/${res.boardId}`
              : `/login?redirect=${encodeURIComponent(`/boards/${res.boardId}`)}`
          );
        }
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Invitation is invalid or expired.';
        setError(msg);
        setStatus('error');
      });
  }, [token, router, user]);

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl bg-white p-8 shadow text-center max-w-sm w-full">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-sm text-gray-500">Processing your invitation…</p>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteContent />
    </Suspense>
  );
}

'use client';

import { useAuthStore } from '@/store/auth';
import { useInitAuth } from '@/hooks/useInitAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  useInitAuth();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (!stored) router.replace('/login');
  }, [router]);

  if (!token && typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
    return null;
  }

  return <>{children}</>;
}

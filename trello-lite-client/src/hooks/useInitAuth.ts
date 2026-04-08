'use client';

import { useAuthStore } from '@/store/auth';
import { User } from '@/types';
import { useEffect } from 'react';

export function useInitAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const raw = localStorage.getItem('user');
    if (token && raw) {
      try {
        const user: User = JSON.parse(raw);
        setAuth(user, token);
      } catch {
        // invalid storage, ignore
      }
    }
  }, [setAuth]);
}

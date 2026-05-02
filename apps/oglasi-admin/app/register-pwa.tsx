'use client';

import { useEffect } from 'react';

export function RegisterPWA() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
  }, []);

  return null;
}

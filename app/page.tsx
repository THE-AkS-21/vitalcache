'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we only run the redirect logic after the component has mounted on the client.
  // This prevents hydration errors since Zustand's persist reads from localStorage.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      router.replace(accessToken ? '/dashboard' : '/login');
    }
  }, [isMounted, accessToken, router]);

  // Return a completely blank screen while we check the token to prevent flashing
  return null;
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login - auth middleware will handle redirecting if already authenticated
    router.push('/auth/login');
  }, [router]);

  return null;
}

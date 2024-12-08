'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getAuthToken } from '@/utils/api/getAuthToken';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          router.push('/home');
        } else {
          router.push('/landing');
        }
      } catch (error) {
        router.push('/landing');
      }
    };
    checkAuth();
    // if (!loading) {
    //   if (user) {
    //     router.push('/home'); // Redirect authenticated users
    //   } else {
    //     router.push('/landing'); // Redirect unauthenticated users
    //   }
    // }
  }, []);

  return <div>Loading...</div>; // Optional loading state

}

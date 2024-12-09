'use client';

import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { authStore } from '@/store/AuthStore';

const IndexPage = observer(() => {
  const router = useRouter();

  useEffect(() => {
    if (authStore.signedIn) {
      router.push('/home');
    } else {
      router.push('/landing');
    }
  }, [authStore.signedIn, router]);

  return <div>Loading...</div>;

});

export default IndexPage;

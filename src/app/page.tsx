'use client';

import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { authStore } from '@/store/AuthStore';
import { reaction } from 'mobx';

const IndexPage = observer(() => {
  const router = useRouter();

  useEffect(() => {
    const disposer = reaction(
      () => authStore.signedIn,
      (signedIn) => {
        if (signedIn) {
          router.push('/agents');
        } else {
          router.push('/landing');
        }
      }
    );

    return () => {
      disposer();
    };
  }, [router]);

  return <div>Loading...</div>;

});

export default IndexPage;

'use client';

import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { authStore } from '@/store/AuthStore';
import { reaction } from 'mobx';
import { Flex, Spinner } from '@chakra-ui/react';

const IndexPage = observer(() => {
  const router = useRouter();

  const routeBasedOnAuth = (isSignedIn: boolean) => {
    if (isSignedIn) {
      router.push('/agents');
    } else {
      router.push('/landing');
    }
  }

  useEffect(() => {
    const disposer = reaction(
      () => authStore.signedIn,
      (isSignedIn) => {
        console.log('Auth changed in index:', isSignedIn);
        routeBasedOnAuth(isSignedIn);
      }
    );

    console.log("Routing base on auth: index")
    routeBasedOnAuth(authStore.signedIn);

    return () => {
      disposer();
    };
  }, []);

  return (
    <Flex justify="center" align="center" width="100vw" height="100vh">
      <Spinner size="lg" />
    </Flex>
  );

});

export default IndexPage;

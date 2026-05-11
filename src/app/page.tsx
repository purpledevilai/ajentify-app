'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Flex, Spinner } from '@chakra-ui/react';

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    const isSignedIn = document.cookie.includes('aj_signed_in=1');
    if (isSignedIn) {
      router.push('/agents');
    } else {
      router.push('/landing');
    }
  }, [router]);

  return (
    <Flex justify="center" align="center" width="100vw" height="100vh">
      <Spinner size="lg" />
    </Flex>
  );
};

export default IndexPage;

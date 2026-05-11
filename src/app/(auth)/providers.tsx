'use client';
import { ChakraProvider } from '@chakra-ui/react';
import { AmplifyConfig } from '@/app/components/AmplifyConfig';
// AuthFlowStoreProvider will be added in deliverable E

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <AmplifyConfig />
      {children}
    </ChakraProvider>
  );
}

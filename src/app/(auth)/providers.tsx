'use client';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { AmplifyConfig } from '@/app/components/AmplifyConfig';
import { AuthFlowStoreProvider } from '@/store/AuthFlowStoreContext';

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <AmplifyConfig />
      <AuthFlowStoreProvider>
        {children}
      </AuthFlowStoreProvider>
    </ChakraProvider>
  );
}

'use client';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { AmplifyConfig } from '@/app/components/AmplifyConfig';
import theme from '@/theme/theme';
import { StoreProvider } from '@/store/StoreContext';
import { ApiClientBinder } from './ApiClientBinder';
// DashboardBoot will be added in deliverable F

export function AuthenticatedProviders({ children }: { children: React.ReactNode }) {
  return (
    <NavigationGuardProvider>
      <ChakraProvider theme={theme}>
        <AmplifyConfig />
        <StoreProvider>
          <ApiClientBinder>
            {children}
          </ApiClientBinder>
        </StoreProvider>
      </ChakraProvider>
    </NavigationGuardProvider>
  );
}

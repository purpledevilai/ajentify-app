'use client';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { AmplifyConfig } from '@/app/components/AmplifyConfig';
import theme from '@/theme/theme';
import { StoreProvider } from '@/store/StoreContext';
import { ApiClientBinder } from './ApiClientBinder';
import { DashboardBoot } from '@/app/components/DashboardBoot';

export function AuthenticatedProviders({ children }: { children: React.ReactNode }) {
  return (
    <NavigationGuardProvider>
      <ChakraProvider theme={theme}>
        <AmplifyConfig />
        <StoreProvider>
          <ApiClientBinder>
            <DashboardBoot>
              {children}
            </DashboardBoot>
          </ApiClientBinder>
        </StoreProvider>
      </ChakraProvider>
    </NavigationGuardProvider>
  );
}

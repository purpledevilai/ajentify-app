'use client';
import { ChakraProvider } from '@chakra-ui/react';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { AmplifyConfig } from '@/app/components/AmplifyConfig';
import theme from '@/theme/theme';
import { ApiClientBinder } from './ApiClientBinder';
// StoreProvider and DashboardBoot will be added in deliverables E and F

export function AuthenticatedProviders({ children }: { children: React.ReactNode }) {
  return (
    <NavigationGuardProvider>
      <ChakraProvider theme={theme}>
        <AmplifyConfig />
        <ApiClientBinder>
          {children}
        </ApiClientBinder>
      </ChakraProvider>
    </NavigationGuardProvider>
  );
}

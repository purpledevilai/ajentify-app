'use client';
import { ChakraProvider } from '@chakra-ui/react';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { AmplifyConfig } from '@/app/components/AmplifyConfig';
import { AlertProvider } from '@/app/components/AlertProvider';
import theme from '@/theme/theme';
// StoreProvider and DashboardBoot will be added in deliverables E and F
// AlertProvider will be removed in deliverable C

export function AuthenticatedProviders({ children }: { children: React.ReactNode }) {
  return (
    <NavigationGuardProvider>
      <ChakraProvider theme={theme}>
        <AmplifyConfig />
        <AlertProvider>
          {children}
        </AlertProvider>
      </ChakraProvider>
    </NavigationGuardProvider>
  );
}

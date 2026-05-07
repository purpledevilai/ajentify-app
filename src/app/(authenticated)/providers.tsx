'use client';

import React from 'react';
import { NavigationGuardProvider } from 'next-navigation-guard';
import ChakraProviders from '@/app/components/ChakraProviders';
import { AlertProvider } from '@/app/components/AlertProvider';
import { AmplifyConfig } from '@/components/AmplifyConfig';
import { AuthInit } from '@/components/auth/AuthInit';
import { AuthBootSplash } from '@/components/auth/AuthBootSplash';

export default function AuthenticatedProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationGuardProvider>
      <ChakraProviders>
        <AmplifyConfig />
        <AuthInit />
        <AlertProvider>
          <AuthBootSplash>{children}</AuthBootSplash>
        </AlertProvider>
      </ChakraProviders>
    </NavigationGuardProvider>
  );
}

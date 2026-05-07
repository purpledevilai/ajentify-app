'use client';

import React from 'react';
import ChakraProviders from '@/app/components/ChakraProviders';
import { AmplifyConfig } from '@/components/AmplifyConfig';
import { AuthInit } from '@/components/auth/AuthInit';

export default function AuthFlowProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProviders>
      <AmplifyConfig />
      <AuthInit />
      {children}
    </ChakraProviders>
  );
}

'use client';

import React from 'react';
import ChakraProviders from '@/app/components/ChakraProviders';

export default function PublicProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChakraProviders>{children}</ChakraProviders>;
}

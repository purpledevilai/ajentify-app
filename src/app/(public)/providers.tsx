'use client';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '@/theme/theme';

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}

import React from 'react';
import PublicProviders from './providers';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicProviders>{children}</PublicProviders>;
}

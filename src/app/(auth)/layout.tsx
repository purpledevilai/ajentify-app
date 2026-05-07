'use client';

import React from 'react';
import AuthFlowProviders from './providers';

/**
 * Auth-flow route-group layout. Mounts the auth-flow provider stack
 * (Chakra + Amplify + auth bootstrap) and lets each page render its
 * own centered card chrome. The plan envisages eventually pulling that
 * chrome up into this layout so individual pages don't duplicate it;
 * for now we keep it page-local to avoid visual regressions while the
 * deliverable's primary goal — bundle separation — is settling.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthFlowProviders>{children}</AuthFlowProviders>;
}

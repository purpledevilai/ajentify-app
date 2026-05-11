'use client';
import { observer } from 'mobx-react-lite';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '@/store/StoreContext';
import { BootSplash } from './BootSplash';

// Top-level authenticated routes prefetched at boot for instant navigation.
// Adding a route: one line here + loading.tsx/error.tsx for the segment (deliverable I).
export const DASHBOARD_ROUTES = [
  '/agents', '/tools', '/sres', '/contexts', '/documents', '/stages', '/integrations', '/chat',
  '/agent-builder', '/tool-builder', '/sre-builder', '/json-document-builder',
  '/api-keys', '/usage', '/profile',
];

export const DashboardBoot = observer(function DashboardBoot({ children }: { children: React.ReactNode }) {
  const root = useStores();
  const { auth } = root;
  const router = useRouter();

  // Auth determination on mount
  useEffect(() => {
    void auth.checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Post-auth: boot load + prefetch
  useEffect(() => {
    if (!auth.signedIn || auth.isDeterminingAuth) return;
    void root.bootLoad?.();
    DASHBOARD_ROUTES.forEach((route) => router.prefetch(route));
  }, [auth.signedIn, auth.isDeterminingAuth]); // eslint-disable-line react-hooks/exhaustive-deps

  if (auth.isDeterminingAuth) {
    return <BootSplash />;
  }

  if (!auth.signedIn) {
    redirect('/signin');
  }

  return <>{children}</>;
});

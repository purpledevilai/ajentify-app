'use client';

import { useEffect } from 'react';
import { authStore } from '@/store/AuthStore';

/**
 * Tiny mount-time bootstrap that kicks off the singleton-`AuthStore`'s
 * `checkAuth()`. Lives separately from `(authenticated)/providers.tsx`
 * so it can be mounted on both the dashboard and auth-flow sides
 * without dragging the dashboard provider stack into `(auth)/`.
 *
 * Replaced by `<DashboardBoot>` (Project 10 deliverable F) on the
 * dashboard side. The auth-flow side stops needing this once
 * `<AuthFlowStoreProvider>` (deliverable E) constructs its own
 * `AuthStore` instance.
 */
export function AuthInit() {
  useEffect(() => {
    void authStore.checkAuth();
  }, []);
  return null;
}

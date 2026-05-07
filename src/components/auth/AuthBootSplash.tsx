'use client';

import { observer } from 'mobx-react-lite';
import { Flex, Spinner } from '@chakra-ui/react';
import { authStore } from '@/store/AuthStore';

/**
 * Stop-gap boot splash for the dashboard side. Shows a spinner while
 * `AuthStore.checkAuth()` resolves on first mount of `(authenticated)/`.
 *
 * Replaced by `<DashboardBoot>` (Project 10 deliverable F), which owns
 * the branded splash, post-auth dashboard prefetch, and the
 * unauthenticated redirect.
 */
export const AuthBootSplash = observer(function AuthBootSplash({
  children,
}: {
  children: React.ReactNode;
}) {
  if (authStore.isDeterminingAuth) {
    return (
      <Flex justify="center" align="center" width="100vw" height="100vh">
        <Spinner size="lg" />
      </Flex>
    );
  }
  return <>{children}</>;
});

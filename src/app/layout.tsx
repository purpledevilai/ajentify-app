'use client';

import { useEffect } from 'react';
import ChakraProviders from "@/app/components/ChakraProviders";
import { AlertProvider } from "@/app/components/AlertProvider";
import { Amplify } from 'aws-amplify';
import { authStore } from '@/store/AuthStore';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID ?? '',
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID ?? '',
    }
  },
})

export default function RootLayout({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    const checkAuth = async () => {
        await authStore.checkAuth();
    };
    checkAuth();
  }, []);

  return (
    <html lang="en">
      <body>
        <ChakraProviders>
          <AlertProvider>
            {children}
          </AlertProvider>
        </ChakraProviders>
      </body>
    </html>
  );
}

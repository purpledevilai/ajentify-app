'use client';

import { useEffect } from 'react';
import ChakraProviders from "@/app/components/ChakraProviders";
import { AlertProvider } from "@/app/components/AlertProvider";
import { Amplify } from 'aws-amplify';
import { authStore } from '@/store/AuthStore';
import { NavigationGuardProvider } from 'next-navigation-guard';

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
      console.log("Auth Token: ", await authStore.getAccessToken());
    };
    checkAuth();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Ajentify</title>
      </head>
      <body>
        <NavigationGuardProvider>
          <ChakraProviders>
            <AlertProvider>
              {children}
            </AlertProvider>
          </ChakraProviders>
        </NavigationGuardProvider>
      </body>
    </html>
  );
}

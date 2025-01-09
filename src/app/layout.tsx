'use client';

import { useEffect } from 'react';
import ChakraProviders from "@/app/components/ChakraProviders";
import { AlertProvider } from "@/app/components/AlertProvider";
import { Amplify } from 'aws-amplify';
import { authStore } from '@/store/AuthStore';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { observer } from 'mobx-react-lite';
import { Flex, Spinner } from '@chakra-ui/react';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID ?? '',
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID ?? '',
    }
  },
})

const RootLayout = observer(({ children }: { children: React.ReactNode }) => {

  useEffect(() => {
    console.log("Checking auth");
    authStore.checkAuth();
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
              {authStore.isDeterminingAuth ? (
                <Flex justify="center" align="center" width="100vw" height="100vh">
                  <Spinner size="lg" />
                </Flex>
              ) : (
                children
              )}
            </AlertProvider>
          </ChakraProviders>
        </NavigationGuardProvider>
      </body>
    </html>
  );
});

export default RootLayout;

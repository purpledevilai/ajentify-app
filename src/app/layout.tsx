'use client';

import ChakraProviders from "@/app/components/ChakraProviders";
import { AlertProvider } from "@/app/components/AlertProvider";
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID,
  }
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
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

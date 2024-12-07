'use client';

import ChakraProviders from "@/components/ChakraProviders";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProviders>
          {children}
        </ChakraProviders>
      </body>
    </html>
  );
}

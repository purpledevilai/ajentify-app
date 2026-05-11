'use client';
import { AuthProviders } from './providers';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviders>
      <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </main>
    </AuthProviders>
  );
}

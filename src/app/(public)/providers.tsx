'use client';
// Minimal public providers — no RootStore, no AuthFlowStore, no Amplify
// When project 08 adds a shadcn theme, it will be added here.

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

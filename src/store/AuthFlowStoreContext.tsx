'use client';
import React, { createContext, useContext } from 'react';
import { AuthFlowStore } from './AuthFlowStore';

const AuthFlowStoreContext = createContext<AuthFlowStore | null>(null);

export function AuthFlowStoreProvider({ children }: { children: React.ReactNode }) {
    const [store] = React.useState(() => new AuthFlowStore());
    return <AuthFlowStoreContext.Provider value={store}>{children}</AuthFlowStoreContext.Provider>;
}

export function useAuthFlowStores(): AuthFlowStore {
    const store = useContext(AuthFlowStoreContext);
    if (!store) throw new Error('useAuthFlowStores must be used inside <AuthFlowStoreProvider>');
    return store;
}

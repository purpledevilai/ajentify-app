'use client';
import React, { createContext, useContext } from 'react';
import { RootStore } from './RootStore';

const StoreContext = createContext<RootStore | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [store] = React.useState(() => new RootStore());
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStores(): RootStore {
    const store = useContext(StoreContext);
    if (!store) throw new Error('useStores must be used inside <StoreProvider>');
    return store;
}

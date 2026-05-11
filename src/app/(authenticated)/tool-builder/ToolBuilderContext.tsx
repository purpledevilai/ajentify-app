import { createContext, useContext } from 'react';
import { ToolBuilderStore } from '@/store/ToolBuilderStore';

export const ToolBuilderStoreContext = createContext<ToolBuilderStore | null>(null);

export function useToolBuilderStore(): ToolBuilderStore {
    const store = useContext(ToolBuilderStoreContext);
    if (!store) throw new Error('useToolBuilderStore must be used inside a ToolBuilderStoreContext.Provider');
    return store;
}

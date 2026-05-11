import { createContext, useContext } from 'react';
import { StructuredResponseEndpointBuilderStore } from '@/store/StructuredResponseEndpointBuilderStore';

export const SREBuilderStoreContext = createContext<StructuredResponseEndpointBuilderStore | null>(null);

export function useSREBuilderStore(): StructuredResponseEndpointBuilderStore {
    const store = useContext(SREBuilderStoreContext);
    if (!store) throw new Error('useSREBuilderStore must be used inside a SREBuilderStoreContext.Provider');
    return store;
}

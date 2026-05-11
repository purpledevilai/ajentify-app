import { createContext, useContext } from 'react';
import { JsonDocumentBuilderStore } from '@/store/JsonDocumentBuilderStore';

export const JsonDocumentBuilderStoreContext = createContext<JsonDocumentBuilderStore | null>(null);

export function useJsonDocumentBuilderStore(): JsonDocumentBuilderStore {
    const store = useContext(JsonDocumentBuilderStoreContext);
    if (!store) throw new Error('useJsonDocumentBuilderStore must be used inside a JsonDocumentBuilderStoreContext.Provider');
    return store;
}

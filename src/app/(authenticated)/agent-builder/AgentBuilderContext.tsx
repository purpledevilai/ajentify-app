import { createContext, useContext } from 'react';
import { AgentBuilderStore } from '@/store/AgentBuilderStore';

export const AgentBuilderStoreContext = createContext<AgentBuilderStore | null>(null);

export function useAgentBuilderStore(): AgentBuilderStore {
    const store = useContext(AgentBuilderStoreContext);
    if (!store) throw new Error('useAgentBuilderStore must be used inside an AgentBuilderStoreContext.Provider');
    return store;
}

import { useState } from 'react';
import { useStores } from './StoreContext';
import { ToolBuilderStore } from './ToolBuilderStore';

export function useToolBuilder(): ToolBuilderStore {
    const { parameterDefinitions } = useStores();
    return useState(() => new ToolBuilderStore({ parameterDefinitions }))[0];
}

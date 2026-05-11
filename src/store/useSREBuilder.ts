import { useState } from 'react';
import { useStores } from './StoreContext';
import { StructuredResponseEndpointBuilderStore } from './StructuredResponseEndpointBuilderStore';

export function useSREBuilder(): StructuredResponseEndpointBuilderStore {
    const { parameterDefinitions } = useStores();
    return useState(() => new StructuredResponseEndpointBuilderStore({ parameterDefinitions }))[0];
}

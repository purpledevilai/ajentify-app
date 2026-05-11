import { useState } from 'react';
import { AgentBuilderStore } from './AgentBuilderStore';

export function useAgentBuilder(): AgentBuilderStore {
    return useState(() => new AgentBuilderStore())[0];
}

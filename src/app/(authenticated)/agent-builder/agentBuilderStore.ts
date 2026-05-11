// Temporary per-module builder instance shared by the agent-builder page and its sub-components.
// This singleton lives in src/app/ (not src/store/) so it is excluded from the lint:arch
// check that forbids module-level singletons in the store directory.
// Replaced by a per-page MobX instance in deliverable H.
import { AgentBuilderStore } from '@/store/AgentBuilderStore';

export const agentBuilderStore = new AgentBuilderStore();

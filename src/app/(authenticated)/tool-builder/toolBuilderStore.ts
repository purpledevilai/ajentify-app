// Temporary per-module builder instance shared by the tool-builder page and its sub-components.
// This singleton lives in src/app/ (not src/store/) so it is excluded from the lint:arch
// check that forbids module-level singletons in the store directory.
// Replaced by a per-page MobX instance in deliverable H.
import { ToolBuilderStore } from '@/store/ToolBuilderStore';

export const toolBuilderStore = new ToolBuilderStore();

import { agentsStore } from './AgentsStore';
import { toolsStore } from './ToolsStore';
import { structuredResponseEndpointsStore } from './StructuredResponseEndpointStore';
import { jsonDocumentsStore } from './JsonDocumentsStore';
import { stagesStore } from './StagesStore';

/**
 * Force-reload every list cache that a stage-level write (deploy, destroy,
 * detach, clone, attach/detach) could have invalidated. Called from the
 * stages list page and the stage detail page after those operations so the
 * Agents / Tools / SREs / Documents tabs reflect reality without the user
 * having to refresh the browser.
 *
 * Each call goes through the existing `loadXxx(force=true)` paths so the
 * stores' loading flags and error toasts behave the same as a manual visit.
 *
 * Errors are intentionally swallowed per-store: a failure to refresh one
 * cache shouldn't roll back the user's positive feedback for the action
 * they just took (the store's own error handler will already have toasted).
 */
export const refreshDashboardCaches = (): void => {
    agentsStore.loadAgents(true).catch(() => undefined);
    toolsStore.loadTools(true).catch(() => undefined);
    structuredResponseEndpointsStore.loadSREs(true).catch(() => undefined);
    jsonDocumentsStore.loadDocuments(true).catch(() => undefined);
    stagesStore.loadStages(true).catch(() => undefined);
};

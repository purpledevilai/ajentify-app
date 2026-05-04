import { makeAutoObservable } from 'mobx';
import { getOrgContexts } from '@/api/context/getOrgContexts';
import { getContext } from '@/api/context/getContext';
import { Context, Message, OrgContextSummary } from '@/types/context';
import { ShowAlertParams } from '@/app/components/AlertProvider';

const PAGE_SIZE = 25;
const PREVIEW_LEN = 140;

/**
 * Convert a full Context into the OrgContextSummary shape used by the
 * Contexts list table. Used when looking up a single context by id —
 * the list endpoint does not support filtering by context_id, so we hit
 * the single-context endpoint and adapt the result.
 */
const contextToSummary = (c: Context): OrgContextSummary => {
    let last_message_preview: string | null = null;
    if (c.messages && c.messages.length > 0) {
        const last: Message = c.messages[c.messages.length - 1];
        if ('sender' in last && typeof last.message === 'string') {
            last_message_preview = last.message.slice(0, PREVIEW_LEN);
        } else if ('type' in last && last.type === 'tool_response' && typeof last.tool_output === 'string') {
            last_message_preview = last.tool_output.slice(0, PREVIEW_LEN);
        } else if ('type' in last && last.type === 'tool_call') {
            try {
                last_message_preview = JSON.stringify(last.tool_input).slice(0, PREVIEW_LEN);
            } catch {
                last_message_preview = null;
            }
        }
    }
    return {
        context_id: c.context_id,
        agent_id: c.agent_id,
        org_id: c.org_id ?? '',
        user_id: c.user_id ?? '',
        client_id: c.client_id ?? null,
        owner_kind: c.user_id === 'public' ? 'public' : 'api_key',
        last_message_preview,
        created_at: c.created_at ?? 0,
        updated_at: c.updated_at ?? 0,
        expires_at: c.expires_at ?? null,
    };
};

class ContextsStore {
    contexts: OrgContextSummary[] = [];
    nextCursor: string | null = null;
    loading = false;
    loadingMore = false;
    // Whether at least one successful load has populated the cache. Used to
    // skip refetching when the user navigates away to a context detail page
    // and comes back to the list.
    loaded = false;

    // The filters that drove the data currently in the cache. The list page
    // keeps draft input state locally and copies these into the store on
    // Apply / Clear so the cached data and the filter UI stay in sync.
    appliedAgentId = '';
    appliedClientId = '';
    appliedContextId = '';

    showAlert: (params: ShowAlertParams) => void = () => undefined;

    constructor() {
        makeAutoObservable(this);
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    };

    setFilters = (filters: {
        agentId?: string;
        clientId?: string;
        contextId?: string;
    }) => {
        this.appliedAgentId = filters.agentId ?? '';
        this.appliedClientId = filters.clientId ?? '';
        this.appliedContextId = filters.contextId ?? '';
    };

    async loadContexts(force: boolean = false) {
        if (!force && this.loaded) {
            return;
        }
        try {
            this.loading = true;

            // Direct lookup by context_id uses the single-context endpoint
            // since the list endpoint does not filter by context_id.
            if (this.appliedContextId) {
                try {
                    const c = await getContext({
                        context_id: this.appliedContextId,
                        with_tool_calls: false,
                    });
                    this.contexts = [contextToSummary(c)];
                } catch {
                    // Treat a missing/forbidden context_id like a filter that
                    // matches nothing, rather than blowing up the page.
                    this.contexts = [];
                }
                this.nextCursor = null;
                this.loaded = true;
                return;
            }

            const response = await getOrgContexts({
                agent_id: this.appliedAgentId || undefined,
                client_id: this.appliedClientId || undefined,
                limit: PAGE_SIZE,
            });
            this.contexts = response.contexts;
            this.nextCursor = response.next_cursor ?? null;
            this.loaded = true;
        } catch (error) {
            this.showAlert({
                title: 'Failed to load contexts',
                message: (error as Error).message || 'Unknown error',
            });
        } finally {
            this.loading = false;
        }
    }

    async loadMore() {
        if (!this.nextCursor || this.loadingMore || this.appliedContextId) {
            return;
        }
        try {
            this.loadingMore = true;
            const response = await getOrgContexts({
                agent_id: this.appliedAgentId || undefined,
                client_id: this.appliedClientId || undefined,
                limit: PAGE_SIZE,
                cursor: this.nextCursor,
            });
            this.contexts = [...this.contexts, ...response.contexts];
            this.nextCursor = response.next_cursor ?? null;
        } catch (error) {
            this.showAlert({
                title: 'Failed to load more contexts',
                message: (error as Error).message || 'Unknown error',
            });
        } finally {
            this.loadingMore = false;
        }
    }

    reset = () => {
        this.contexts = [];
        this.nextCursor = null;
        this.loading = false;
        this.loadingMore = false;
        this.loaded = false;
        this.appliedAgentId = '';
        this.appliedClientId = '';
        this.appliedContextId = '';
    };
}

export const contextsStore = new ContextsStore();
export const CONTEXTS_PAGE_SIZE = PAGE_SIZE;

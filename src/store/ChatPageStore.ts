import { makeAutoObservable } from 'mobx';
import { getAgents } from '@/api/agent/getAgents';
import { getContextHistory } from '@/api/context/getContextHistory';
import { getContext } from '@/api/context/getContext';
import { createContext } from '@/api/context/createContext';
import { deleteContext } from '@/api/context/deleteContext';
import { Agent } from '@/types/agent';
import { Context } from '@/types/context';
import { ContextHistory } from '@/types/contexthistory';

class ChatPageStore {
    hasInitiatedLoad: boolean = false;
    agents: Agent[] | undefined = undefined;
    agentsLoading: boolean = true;
    agentsError: string | null = null;
    currentContext: Context | undefined = undefined;
    currentAgentName: string | undefined = undefined;
    currentContextLoading: boolean = false;
    currentContextError: string | null = null;
    contextHistory: ContextHistory[] | undefined = undefined;
    contextHistoryLoading: boolean = false;
    contextHistoryError: string | null = null;
    deleteContextError: string | null = null;
    startConversationError: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        this.hasInitiatedLoad = false;
        this.agents = undefined;
        this.agentsLoading = true;
        this.agentsError = null;
        this.currentContext = undefined;
        this.currentAgentName = undefined;
        this.currentContextLoading = false;
        this.currentContextError = null;
        this.contextHistory = undefined;
        this.contextHistoryLoading = false;
        this.contextHistoryError = null;
        this.deleteContextError = null;
        this.startConversationError = null;
    }

    async loadData(force = false) {
        if (this.hasInitiatedLoad && !force) {
            return;
        }
        this.hasInitiatedLoad = true;
        this.loadAgents(force);
        this.loadContextHistory(force);
    }

    async loadAgents(force: boolean = false) {
        if (!force && this.agents) {
            return;
        }
        try {
            this.agentsError = null;
            this.agentsLoading = true;
            this.agents = await getAgents();
            if (this.currentAgentName === undefined) {
                if (this.agents.length > 0) {
                    this.currentAgentName = this.agents[0].agent_name;
                } else {
                    this.currentAgentName = 'No agents available';
                }
            }
        } catch (error) {
            this.agentsError = (error as Error).message;
        } finally {
            this.agentsLoading = false;
        }
    }

    async loadContextHistory(force: boolean = false) {
        if (!force && (this.contextHistory?.length ?? 0) > 0) {
            return;
        }
        try {
            this.contextHistoryError = null;
            this.contextHistoryLoading = true;
            try {
                this.contextHistory = await getContextHistory();
            }
            catch (error) {
                console.log('Error loading context history:', error);
                this.contextHistory = [];
            }            
            if (this.contextHistory.length > 0 && this.currentContext === undefined) { // in the case of the first load
                const lastContext = this.contextHistory[0];
                this.loadAndSetCurrentContext(lastContext.context_id);
                this.currentAgentName = lastContext.agent.agent_name;
            }
        } catch (error) {
            this.contextHistoryError = (error as Error).message;
        } finally {
            this.contextHistoryLoading = false;
        }
    }

    async loadAndSetCurrentContext(context_id: string) {
        try {
            this.currentContextError = null;
            this.currentContextLoading = true;
            this.currentContext = await getContext({ context_id });
        } catch (error) {
            this.currentContextError = (error as Error).message;
        } finally {
            this.currentContextLoading = false;
        }
    }

    async selectContext(context_id: string, agent_name: string) {
        this.currentAgentName = agent_name;
        this.loadAndSetCurrentContext(context_id);
    }

    async startNewConversation(agent: Agent) {
        try {
            this.startConversationError = null;
            this.currentContextLoading = true;
            const newContext = await createContext({ agent_id: agent.agent_id });
            this.currentAgentName = agent.agent_name;
            this.currentContext = newContext;
            this.loadContextHistory(true);
        } catch (error) {
            this.startConversationError = (error as Error).message;
        } finally {
            this.currentContextLoading = false;
        }
    }

    async deleteContext(context_id: string) {
        try {
            this.deleteContextError = null;
            this.contextHistoryLoading = true;
            if (this.currentContext?.context_id === context_id) {
                this.currentContext = undefined;
                this.currentAgentName = undefined;
                await deleteContext({ context_id });
                await this.loadContextHistory(true);
            } else {
                deleteContext({ context_id });
                const contextIndex = this.contextHistory?.findIndex((context) => context.context_id === context_id) ?? -1;
                if (contextIndex > -1) {
                    this.contextHistory?.splice(contextIndex, 1);
                }
            }
        } catch (error) {
            this.deleteContextError = (error as Error).message;
        } finally {
            this.contextHistoryLoading = false;
        }
    }
}

export const chatPageStore = new ChatPageStore();

import { makeAutoObservable } from 'mobx';
import { getAgents } from '@/api/agent/getAgents';
import { getContextHistory } from '@/api/context/getContextHistory';
import { getContext } from '@/api/context/getContext';
import { createContext } from '@/api/context/createContext';
import { deleteContext } from '@/api/context/deleteContext';
import { Agent } from '@/types/agent';
import { Context } from '@/types/context';
import { ContextHistory } from '@/types/contexthistory';
import { ShowAlertParams } from '@/app/components/AlertProvider';

class ChatPageStore {
    hasInitiatedLoad: boolean = false;
    agents: Agent[] | undefined = undefined;
    agentsLoading: boolean = true;
    currentContext: Context | undefined = undefined;
    currentAgentName: string | undefined = undefined;
    currentContextLoading: boolean = false;
    contextHistory: ContextHistory[] | undefined = undefined;
    contextHistoryLoading: boolean = false;

    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;

    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        this.hasInitiatedLoad = false;
        this.agents = undefined;
        this.agentsLoading = true;
        this.currentContext = undefined;
        this.currentAgentName = undefined;
        this.currentContextLoading = false;
        this.contextHistory = undefined;
        this.contextHistoryLoading = false;
    }

    setShowAlert(showAlert: (params: ShowAlertParams) => void) {
        this.showAlert = showAlert;
    }

    showAlertMessage(title: string, message: string) {
        this.showAlert({ 
            title,
            message
        });
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
            this.showAlertMessage('Failed to load agents', (error as Error).message);
        } finally {
            this.agentsLoading = false;
        }
    }

    async loadContextHistory(force: boolean = false) {
        if (!force && (this.contextHistory?.length ?? 0) > 0) {
            return;
        }
        try {
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
            this.showAlertMessage('Failed to load context history', (error as Error).message);
        } finally {
            this.contextHistoryLoading = false;
        }
    }

    async loadAndSetCurrentContext(context_id: string) {
        try {
            this.currentContextLoading = true;
            this.currentContext = await getContext({ context_id });
        } catch (error) {
            this.showAlertMessage('Failed to load context', (error as Error).message);
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
            this.currentContextLoading = true;
            const newContext = await createContext({ agent_id: agent.agent_id });
            this.currentAgentName = agent.agent_name;
            this.currentContext = newContext;
            this.loadContextHistory(true);
        } catch (error) {
            this.showAlertMessage('Failed to start new conversation', (error as Error).message);
        } finally {
            this.currentContextLoading = false;
        }
    }

    async deleteContext(context_id: string) {
        try {
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
            this.showAlertMessage('Failed to delete conversation', (error as Error).message);
        } finally {
            this.contextHistoryLoading = false;
        }
    }
}

export const chatPageStore = new ChatPageStore();
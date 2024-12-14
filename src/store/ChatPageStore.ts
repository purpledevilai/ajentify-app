import { makeAutoObservable } from 'mobx';
import { getAgents } from '@/api/agent/getAgents';
import { getContextHistory } from '@/api/context/getContextHistory';
import { getContext } from '@/api/context/getContext';
import { Agent } from '@/types/agent';
import { Context } from '@/types/context';
import { ContextHistory } from '@/types/contexthistory';

class ChatPageStore {
    hasInitiatedLoad: boolean = false;
    agents: Agent[] | undefined = undefined;
    agentsLoading: boolean = true;
    currentContext: Context | undefined = undefined;
    currentAgentName: string | undefined = undefined;
    currentContextLoading: boolean = false;
    contextHistory: ContextHistory[] | undefined = undefined;
    contextHistoryLoading: boolean = false;

    showAlert: boolean = false;
    alertTitle: string = '';
    alertMessage: string = '';

    constructor() {
        makeAutoObservable(this);
    }

    showAlertMessage(title: string, message: string) {
        this.alertTitle = title;
        this.alertMessage = message;
        this.showAlert = true;
    }

    closeAlert() {
        this.showAlert = false;
        this.alertTitle = '';
        this.alertMessage = '';
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
            this.contextHistory = await getContextHistory();
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
}

export const chatPageStore = new ChatPageStore();
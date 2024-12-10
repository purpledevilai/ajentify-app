import { makeAutoObservable } from 'mobx';
import { getAgents } from '@/api/agent/getAgents';
import { Agent } from '@/types/agent';

class AgentsStore {
    agents: Agent[] | undefined = undefined;
    agentsLoading = true;

    constructor() {
        makeAutoObservable(this);
    }

    async loadAgents(force: boolean = false) {
        if (!force && this.agents) {
            return;
        }

        try {
            this.agentsLoading = true;
            this.agents = await getAgents();
        } catch (error) {
            console.error('Failed to load agents', error);
        } finally {
            this.agentsLoading = false;
        }
    }
}

export const agentsStore = new AgentsStore();
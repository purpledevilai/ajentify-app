import { makeAutoObservable } from 'mobx';
import { getAgents } from '@/api/agent/getAgents';
import { Agent } from '@/types/agent';

export class AgentsStore {
    agentsError: string | null = null;
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
            this.agentsError = null;
            this.agentsLoading = true;
            this.agents = await getAgents();
        } catch (error) {
            this.agentsError = (error as Error).message;
        } finally {
            this.agentsLoading = false;
        }
    }

    reset = () => {
        this.agents = undefined;
    }
}


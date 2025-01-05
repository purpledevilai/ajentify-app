import { makeAutoObservable } from 'mobx';
import { getAgents } from '@/api/agent/getAgents';
import { Agent } from '@/types/agent';
import { ShowAlertParams } from "@/app/components/AlertProvider";

class AgentsStore {
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    agents: Agent[] | undefined = undefined;
    agentsLoading = true;

    constructor() {
        makeAutoObservable(this);
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    async loadAgents(force: boolean = false) {
        if (!force && this.agents) {
            return;
        }

        try {
            this.agentsLoading = true;
            this.agents = await getAgents();
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message
            })
        } finally {
            this.agentsLoading = false;
        }
    }
}

export const agentsStore = new AgentsStore();
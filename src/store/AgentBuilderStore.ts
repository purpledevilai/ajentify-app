import { Agent } from "@/types/agent";
import { Context } from "@/types/context";
import { makeAutoObservable } from "mobx";
import { createContext } from "@/api/context/createContext";
import { createAgent } from "@/api/agent/createAgent";
import { updateAgent } from "@/api/agent/updateAgent";

interface AgentStringFields {
    agent_name: string;
    agent_description: string;
    prompt: string;
}

interface AgentBooleanFields {
    is_public: boolean;
    agent_speaks_first: boolean;
}


class AgentBuilderStore {

    hasInitiatedLoad = false;

    currentAgent: Agent = {
        agent_id: '',
        agent_name: '',
        agent_description: '',
        is_public: false,
        agent_speaks_first: false,
        prompt: '',
    };
    hasAnUpdate = false;
    agentLoading = true;

    promptEngineerContext: Context | undefined = undefined;
    promptEngineerContextLoading = true;

    agentContext: Context | undefined = undefined;
    agentContextLoading = true;


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

    initiateNewAgentState() {
        if (this.hasInitiatedLoad) return;
        this.hasInitiatedLoad = true;
        this.currentAgent = {
            agent_id: '',
            agent_name: '',
            agent_description: '',
            is_public: false,
            agent_speaks_first: false,
            prompt: '',
        };
        this.hasAnUpdate = false;
        this.createPromptEngineerContext();
    }

    setStringField(field: keyof AgentStringFields, value: string) {
        this.currentAgent[field] = value;
        this.hasAnUpdate = true;
    }

    setBooleanField(field: keyof AgentBooleanFields, value: boolean) {
        this.currentAgent[field] = value;
        this.hasAnUpdate = true;
    }

    async createAgent() {
        if (this.currentAgent.agent_id) {
            this.showAlertMessage('Error', 'Agent already exists. Please update the agent instead.');
            return;
        }
        try {
            this.agentLoading = true;
            const agent = await createAgent({
                agent_name: this.currentAgent.agent_name,
                agent_description: this.currentAgent.agent_description,
                is_public: this.currentAgent.is_public,
                prompt: this.currentAgent.prompt,
            });
            this.currentAgent = agent;
        } catch (error) {
            this.showAlertMessage('Error', (error as Error).message);
        } finally {
            this.agentLoading = false;
        }
    }

    async updateAgent() {
        if (!this.currentAgent.agent_id) {
            this.showAlertMessage('Error', 'Agent does not exist. Please create the agent first.');
            return;
        }
        try {
            this.agentLoading = true;
            const agent = await updateAgent({
                agent_id: this.currentAgent.agent_id,
                agent_name: this.currentAgent.agent_name,
                agent_description: this.currentAgent.agent_description,
                is_public: this.currentAgent.is_public,
                prompt: this.currentAgent.prompt,
            });
            this.currentAgent = agent;
        } catch (error) {
            this.showAlertMessage('Error', (error as Error).message);
        } finally {
            this.agentLoading = false;
        }
    }

    async createPromptEngineerContext() {
        try {
            this.promptEngineerContextLoading = true;
            const context = await createContext({
                agent_id: 'aj-prompt-engineer',
                invoke_agent_message: true
            });
            this.promptEngineerContext = context;
        } catch (error) {
            this.showAlertMessage('Error', (error as Error).message);
        } finally {
            this.promptEngineerContextLoading = false;
        }
    }

    async createAgentContext() {
        try {
            this.agentContextLoading = true;
            const context = await createContext({
                agent_id: this.currentAgent.agent_id,
                invoke_agent_message: this.currentAgent.agent_speaks_first
            });
            this.agentContext = context;
        } catch (error) {
            this.showAlertMessage('Error', (error as Error).message);
        } finally {
            this.agentContextLoading = false;
        }
    }
}
export const agentBuilderStore = new AgentBuilderStore();
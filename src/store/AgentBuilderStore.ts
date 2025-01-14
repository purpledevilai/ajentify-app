import { Agent } from "@/types/agent";
import { Context } from "@/types/context";
import { makeAutoObservable } from "mobx";
import { createContext } from "@/api/context/createContext";
import { deleteContext } from "@/api/context/deleteContext";
import { createAgent } from "@/api/agent/createAgent";
import { deleteAgent } from "@/api/agent/deleteAgent";
import { updateAgent } from "@/api/agent/updateAgent";
import { ShowAlertParams } from "@/app/components/AlertProvider";
import { agentsStore } from "./AgentsStore";

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

    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;

    isNewAgent = false;
    currentAgent: Agent = {
        agent_id: '',
        agent_name: '',
        agent_description: '',
        is_public: false,
        agent_speaks_first: false,
        prompt: '',
    };
    hasUpdates = false;
    agentLoading = false;
    agentDeleteLoading = false;

    promptEngineerContext: Context | undefined = undefined;
    promptEngineerContextLoading = false;

    agentContext: Context | undefined = undefined;
    agentContextLoading = false;

    showDeleteButton = false;
    showAgentId = false;

    constructor() {
        makeAutoObservable(this);
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    setIsNewAgent(isNewAgent: boolean) {
        this.isNewAgent = isNewAgent;
    }

    setCurrentAgent(agent: Agent) {
        this.currentAgent = agent;
        this.hasUpdates = false;
        this.showDeleteButton = true;
        this.showAgentId = true;
    }

    async setCurrentAgentWithId(agentId: string) {
        await agentsStore.loadAgents(); // not forced, will only load if data not available
        if (!agentsStore.agents) {
            this.showAlert({
                title: "Whoops",
                message: "There was a problem loading the agents"
            })
            return;
        }
        const agent = agentsStore.agents.find((a) => a.agent_id === agentId);
        if (!agent) {
            this.showAlert({
                title: "Whoops",
                message: "Could not find agent"
            })
            return;
        }
        this.setCurrentAgent(agent);
    }

    reset = () => {
        this.isNewAgent = false;
        this.currentAgent = {
            agent_id: '',
            agent_name: '',
            agent_description: '',
            is_public: false,
            agent_speaks_first: false,
            prompt: '',
        };
        this.hasUpdates = false;
        this.agentLoading = false;
        this.promptEngineerContext = undefined;
        this.promptEngineerContextLoading = false;
        this.agentContext = undefined;
        this.agentContextLoading = false;
        this.showDeleteButton = false;
        this.agentDeleteLoading = false;
        this.showAgentId = false;
    }

    setStringField(field: keyof AgentStringFields, value: string) {
        this.currentAgent[field] = value;
        this.hasUpdates = true;
    }

    setBooleanField(field: keyof AgentBooleanFields, value: boolean) {
        this.currentAgent[field] = value;
        this.hasUpdates = true;
    }

    async createAgent() {
        if (this.currentAgent.agent_id) {
            this.showAlert({
                title: 'Error',
                message: 'Agent already exists. Please update the agent instead.',
            })
            return;
        }
        try {
            this.agentLoading = true;
            const agent = await createAgent({
                agent_name: this.currentAgent.agent_name,
                agent_description: this.currentAgent.agent_description,
                is_public: this.currentAgent.is_public,
                prompt: this.currentAgent.prompt,
                agent_speaks_first: this.currentAgent.agent_speaks_first,
            });
            this.currentAgent = agent;
            this.hasUpdates = false;
        } catch (error) {
            this.showAlert({
                title: 'Error',
                message: (error as Error).message,
            })
        } finally {
            this.agentLoading = false;
        }
    }

    async updateAgent() {
        if (!this.currentAgent.agent_id) {
            this.showAlert({
                title: 'Error',
                message: 'Agent does not exist. Please create the agent first.',
            })
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
                agent_speaks_first: this.currentAgent.agent_speaks_first,
            });
            this.currentAgent = agent;
            this.hasUpdates = false;
        } catch (error) {
            this.showAlert({
                title: 'Error',
                message: (error as Error).message,
            })
        } finally {
            this.agentLoading = false;
        }
    }

    async deleteAgent() {
        if (!this.currentAgent.agent_id) {
            this.showAlert({
                title: 'Error',
                message: 'Agent does not exist. Please create the agent first.',
            })
            return;
        }
        try {
            this.agentDeleteLoading = true;
            await deleteAgent(this.currentAgent.agent_id);
        } catch (error) {
            this.showAlert({
                title: 'Error',
                message: (error as Error).message,
            })
        } finally {
            this.agentDeleteLoading = false;
        }
    }

    async deletePromptEngineerContext() {
        if (this.promptEngineerContext) {
            try {
                await deleteContext({context_id: this.promptEngineerContext.context_id});
                this.promptEngineerContext = undefined;
            } catch (error) {
                this.showAlert({
                    title: 'Error',
                    message: (error as Error).message,
                })
            }
        }
    }

    async deleteAgentContext() {
        if (this.agentContext) {
            try {
                await deleteContext({context_id: this.agentContext.context_id});
                this.agentContext = undefined;
            } catch (error) {
                this.showAlert({
                    title: 'Error',
                    message: (error as Error).message,
                })
            }
        }
    }

    async onTestAgentClick() {
        if (this.currentAgent.agent_id) {
            if (this.hasUpdates) {
                await this.updateAgent();
            }
        } else {
            await this.createAgent();
        }
        await this.createAgentContext();
    }

    async onSaveAgentClick() {
        if (this.currentAgent.agent_id) {
            if (this.hasUpdates) {
                await this.updateAgent();
            }
        } else {
            await this.createAgent();
        }
        this.isNewAgent = false; // Keeps new agent from deleting after saving
    }

    async createPromptEngineerContext() {
        try {
            this.promptEngineerContextLoading = true;
            const context = await createContext({
                agent_id: 'aj-prompt-engineer-latest',
                prompt_args: {
                    agent_name: this.currentAgent.agent_name,
                    agent_description: this.currentAgent.agent_description,
                    agent_prompt: this.currentAgent.prompt,
                }
            });
            this.promptEngineerContext = context;
        } catch (error) {
            this.showAlert({
                title: 'Error',
                message: (error as Error).message,
            })
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
            this.showAlert({
                title: 'Error',
                message: (error as Error).message,
            })
        } finally {
            this.agentContextLoading = false;
        }
    }
}
export const agentBuilderStore = new AgentBuilderStore();
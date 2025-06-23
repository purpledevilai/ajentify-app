import { Agent } from "@/types/agent";
import { Context } from "@/types/context";
import { makeAutoObservable, computed } from "mobx";
import { createContext } from "@/api/context/createContext";
import { deleteContext } from "@/api/context/deleteContext";
import { createAgent } from "@/api/agent/createAgent";
import { deleteAgent } from "@/api/agent/deleteAgent";
import { updateAgent } from "@/api/agent/updateAgent";
import { ShowAlertParams } from "@/app/components/AlertProvider";
import { getTools } from "@/api/tool/getTools";
import { agentsStore } from "./AgentsStore";
import { Tool } from "@/types/tools";

interface AgentStringFields {
    agent_name: string;
    agent_description: string;
    voice_id: string;
    prompt: string;
}

interface AgentBooleanFields {
    is_public: boolean;
    agent_speaks_first: boolean;
    uses_prompt_args: boolean;
}


class AgentBuilderStore {

    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;

    isNewAgent = false;
    currentAgent: Agent = {
        agent_id: '',
        agent_name: '',
        agent_description: '',
        voice_id: '',
        is_public: false,
        agent_speaks_first: false,
        uses_prompt_args: false,
        prompt: '',
        tools: [],
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

    agentTools: string[] = [
        'memory',
        'web_search',
        'custom_code',
        'pass_event'
    ]
    presentedAgentTool: string = 'memory';

    showPromptArgsInput: boolean = false;
    promptArgsInput: Record<string, string> = {};

    tools: Tool[] = []
    isLoadingTools = false;

    get promptArgs(): string[] {
        if (!this.currentAgent.uses_prompt_args) {
            return [];
        }
        const matches = this.currentAgent.prompt.match(/\{([^}]+)\}/g) || [];
        return matches.map((match) => match.replace(/[{}]/g, ""));
    }

    constructor() {
        makeAutoObservable(this, {
            promptArgs: computed,
        });
    }

    reset = () => {
        this.isNewAgent = false;
        this.currentAgent = {
            agent_id: '',
            agent_name: '',
            agent_description: '',
            voice_id: '',
            is_public: false,
            agent_speaks_first: false,
            uses_prompt_args: false,
            prompt: '',
            tools: [],
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
        this.presentedAgentTool = 'memory';
        this.showPromptArgsInput = false;
        this.promptArgsInput = {};
        this.tools = [];
        this.isLoadingTools = false;
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    setIsNewAgent(isNewAgent: boolean) {
        this.isNewAgent = isNewAgent;
    }

    loadAgentTools = async () => {
        
        try {
            this.isLoadingTools = true;
            const tools = await getTools(this.currentAgent.agent_id);
            this.tools = tools;
        } catch (error) {
            this.showAlert({
                title: 'Error',
                message: (error as Error).message,
            })
        } finally {
            this.isLoadingTools = false;
        }
    }

    async setCurrentAgent(agent: Agent) {
        this.currentAgent = agent;
        if (!this.currentAgent.tools) {
            this.currentAgent.tools = [];
        } else {
            await this.loadAgentTools();
        }
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

    setStringField(field: keyof AgentStringFields, value: string) {
        this.currentAgent[field] = value;
        this.hasUpdates = true;
    }

    setBooleanField(field: keyof AgentBooleanFields, value: boolean) {
        this.currentAgent[field] = value;
        this.hasUpdates = true;
    }

    addTool(tool: Tool) {
        this.currentAgent?.tools?.push(tool.tool_id);
        this.tools.push(tool);
        this.hasUpdates = true;
    }

    removeTool(tool: Tool) {
        this.currentAgent.tools = this.currentAgent?.tools?.filter((t) => tool.tool_id !== t);
        this.tools = this.tools.filter((t) => tool.tool_id !== t.tool_id);
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
                voice_id: this.currentAgent.voice_id,
                tools: this.currentAgent.tools,
                uses_prompt_args: this.currentAgent.uses_prompt_args,
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
                voice_id: this.currentAgent.voice_id,
                tools: this.currentAgent.tools,
                uses_prompt_args: this.currentAgent.uses_prompt_args,
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
        
        this.showPromptArgsInput = (this.currentAgent.uses_prompt_args ?? false) && (this.promptArgs.length > 0)
        if (this.showPromptArgsInput) {
            // Filter out any prompt arg inputs that are not in prompt args
            const filteredPromptArgInput: Record<string, string> = {};
            for (const promptArg of this.promptArgs) {
                filteredPromptArgInput[promptArg] = this.promptArgsInput[promptArg] ?? '';
            }
            this.promptArgsInput = filteredPromptArgInput;
            return; // Don't create context if prompt args are needed
        }
        await this.createAgentContext();
    }

    updatePromptArg(key: string, value: string) {
        this.promptArgsInput[key] = value;
    }

    onPromptArgsSubmit() {
        this.showPromptArgsInput = false;
        this.createAgentContext(this.promptArgsInput);
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
                    agent_tools: JSON.stringify(this.tools),
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

    async createAgentContext(promptArgs?: Record<string, string>) {
        try {
            this.agentContextLoading = true;
            const context = await createContext({
                agent_id: this.currentAgent.agent_id,
                prompt_args: promptArgs
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

    setPresentedAgentTool(tool: string) {
        this.presentedAgentTool = tool;
    }
}
export const agentBuilderStore = new AgentBuilderStore();
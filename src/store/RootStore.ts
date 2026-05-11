import { ParameterDefinitionsStore } from './ParameterDefinitionsStore';
import { ModelsStore } from './ModelsStore';
import { ContextsStore } from './ContextsStore';
import { IntegrationsStore } from './IntegrationsStore';
import { StagesStore } from './StagesStore';
import { ToolsStore } from './ToolsStore';
import { AgentsStore } from './AgentsStore';
import { JsonDocumentsStore } from './JsonDocumentsStore';
import { StructuredResponseEndpointsStore } from './StructuredResponseEndpointStore';
import { CreateTeamStore } from './CreateTeamStore';
import { ChatPageStore } from './ChatPageStore';
import { AuthStore } from './AuthStore';

export class RootStore {
    parameterDefinitions: ParameterDefinitionsStore;
    models: ModelsStore;
    contexts: ContextsStore;
    integrations: IntegrationsStore;
    stages: StagesStore;
    tools: ToolsStore;
    agents: AgentsStore;
    jsonDocuments: JsonDocumentsStore;
    sres: StructuredResponseEndpointsStore;
    createTeam: CreateTeamStore;
    chat: ChatPageStore;
    auth: AuthStore;

    constructor() {
        // No-dep leaves first
        this.parameterDefinitions = new ParameterDefinitionsStore();
        this.models = new ModelsStore();
        this.contexts = new ContextsStore();
        this.integrations = new IntegrationsStore();
        this.stages = new StagesStore();
        this.tools = new ToolsStore();
        this.agents = new AgentsStore();
        this.jsonDocuments = new JsonDocumentsStore();
        this.sres = new StructuredResponseEndpointsStore();

        // createTeam receives agents so pollJobStatus can refresh the list
        this.createTeam = new CreateTeamStore(this.agents);

        // Persistent chat session — forward-looking placement for the chat panel in project 08
        this.chat = new ChatPageStore();

        // Auth last; it gets a callback back into the root for resets
        this.auth = new AuthStore({ resetAll: () => this.resetAll() });
    }

    resetAll = () => {
        this.parameterDefinitions.reset();
        this.models.reset();
        this.contexts.reset();
        this.integrations.reset();
        this.stages.reset();
        this.tools.reset();
        this.agents.reset();
        this.jsonDocuments.reset();
        this.sres.reset();
        this.createTeam.reset();
        this.chat.reset();
    };

    bootLoad = async () => {
        // Step 1: no-dependency leaf caches — fire in parallel
        await Promise.all([
            this.parameterDefinitions.loadParameterDefinitions(),
            this.models.loadModels(),
        ]);

        // Step 2: tool/sre caches depend on PDs being warm for builder lookups
        await Promise.all([
            this.tools.loadTools(),
            this.sres.loadSREs(),
        ]);

        // Step 3: agents + lower-priority caches
        await Promise.all([
            this.agents.loadAgents(),
            this.integrations.loadIntegrations(),
            this.stages.loadStages(),
            this.contexts.loadContexts(),
        ]);
    };

    refreshDashboardCaches = () => {
        this.agents.loadAgents(true).catch(() => undefined);
        this.tools.loadTools(true).catch(() => undefined);
        this.sres.loadSREs(true).catch(() => undefined);
        this.jsonDocuments.loadDocuments(true).catch(() => undefined);
        this.stages.loadStages(true).catch(() => undefined);
        this.parameterDefinitions.loadParameterDefinitions(true).catch(() => undefined);
    };
}

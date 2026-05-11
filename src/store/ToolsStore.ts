import { makeAutoObservable } from 'mobx';
import { Tool } from '@/types/tools';
import { getTools } from '@/api/tool/getTools';

class ToolsStore {
    toolsError: string | null = null;
    tools: Tool[] | undefined = undefined;
    toolsLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    async loadTools(force: boolean = false) {
        if (!force && this.tools) {
            return;
        }

        try {
            this.toolsError = null;
            this.toolsLoading = true;
            this.tools = await getTools();
        } catch (error) {
            this.toolsError = (error as Error).message;
        } finally {
            this.toolsLoading = false;
        }
    }

    reset = () => {
        this.tools = undefined;
    }
}

export const toolsStore = new ToolsStore();

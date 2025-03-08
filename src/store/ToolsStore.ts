import { makeAutoObservable } from 'mobx';
import { ShowAlertParams } from "@/app/components/AlertProvider";
import { Tool } from '@/types/tools';

class ToolsStore {
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    tools: Tool[] | undefined = undefined;
    toolsLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    async loadTools(force: boolean = false) {
        if (!force && this.tools) {
            return;
        }

        try {
            this.toolsLoading = true;
            //this.tools = await getAgents();
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message
            })
        } finally {
            this.toolsLoading = false;
        }
    }

    reset = () => {
        this.tools = undefined;
    }
}

export const toolsStore = new ToolsStore();
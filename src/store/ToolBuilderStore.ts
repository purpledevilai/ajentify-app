import { makeAutoObservable } from 'mobx';
import { ShowAlertParams } from '@/app/components/AlertProvider';
import { authStore } from './AuthStore';
import { desc } from 'framer-motion/client';
import { get } from 'http';

export const paramTypes = [
    'string',
    'number',
    'boolean',
    'object',
    'array',
    'enum',
]

const defaultTool = {
    tool_id: '',
    org_id: '',
    name: '',
    description: '',
    parameters: [],
}

class ToolBuilderStore {

    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    tool: Record<string, any> = {};
    toolSaving = false;
    toolDeleting = false;
    

    constructor() {
        this.tool = defaultTool;
        makeAutoObservable(this);
    }

    reset = () => {
        this.tool = defaultTool;
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    initiateNew = () => {
        this.tool = {
            ...defaultTool,
            org_id: authStore.user?.organizations[0].id || '',
        };
    }

    setTool = (tool: Record<string, any>) => {
        this.tool = tool;
    }

    setToolWithId = async (toolId: string) => {
        /*
        await chatPagesStore.loadChatPages();
        if (!chatPagesStore.chatPages) {
            this.showAlert({
                title: 'Whoops',
                message: 'There was a problem loading the chat pages',
            });
            return;
        }
        const chatPage = chatPagesStore.chatPages.find((c) => c.chat_page_id === toolId);
        if (!chatPage) {
            this.showAlert({
                title: 'Whoops',
                message: 'Could not find chat page',
            });
            return;
        }
        this.setTool(chatPage);
        */
    }


    get isUpdating() {
        return this.tool.chat_page_id !== '';
    }

    setName = (name: string) => {
        this.tool.name = name;
    }

    setDescription = (description: string) => {
        this.tool.description = description;
    }

    getPerameters = (indexArray: number[]) => {
        let perameters =  this.tool.parameters;
        for (let i = 0; i < indexArray.length; i++) {
            perameters = perameters[indexArray[i]].parameters;
        }
        return perameters;
    }

    addParameter = (indexArray: number[]) => {
        let parameters = this.getPerameters(indexArray);
        parameters.push({
            name: '',
            type: 'string',
            description: '',
        });
    }

    deleteParameter = (indexArray: number[]) => {
        const parametersArray = indexArray.slice(0, -1);
        const index = indexArray[indexArray.length - 1];

        console.log("parametersArray", parametersArray);
        console.log("index", index);
    
        let parameters = this.getPerameters(parametersArray);
        console.log("parameters", parameters);
        //parameters = parameters.filter((_: any, i: number) => i !== index);
        // Slice out the parameter
        parameters.splice(index, 1);
        console.log("resulting parameters", parameters);
    }

    getParameter = (indexArray: number[]) => {
        let parameters = this.tool.parameters;
        let parameter = null;
        for (let i = 0; i < indexArray.length; i++) {
            parameter = parameters[indexArray[i]];
            parameters = parameter.parameters
        }
        return parameter;
    }

    setParameterName = (indexArray: number[], name: string) => {
        const parameter = this.getParameter(indexArray);
        parameter.name = name;
    }

    setParameterType = (indexArray: number[], type: string) => {
        const parameter = this.getParameter(indexArray);
        parameter.type = type;
        if (type === 'object' || type === 'array' || type === 'enum') {
            parameter.parameters = [{
                name: '',
                type: 'string',
                description: '',
            }];
        }
    }

    setParameterDescription = (indexArray: number[], description: string) => {
        const parameter = this.getParameter(indexArray);
        parameter.description = description;
    }



    saveTool = async (): Promise<boolean> => {
        try {
            this.toolSaving = true;
            if (this.isUpdating) {
                //await updateChatPage(this.tool);
            } else {
                //await createChatPage(this.tool);
            }
            return true;
        } catch (error) {
            this.showAlert({
                title: 'Whoops',
                message: (error as Error).message,
            })
            return false;
        } finally {
            this.toolSaving = false;
        }
    }

    deleteTool = async (): Promise<boolean> => {
        try {
            this.toolDeleting = true;
            //await deleteChatPage(this.tool.chat_page_id);
            return true;
        } catch (error) {
            this.showAlert({
                title: 'Whoops',
                message: (error as Error).message,
            })
            return false;
        } finally {
            this.toolDeleting = false;
        }
    }
    
}

export const toolBuilderStore = new ToolBuilderStore();
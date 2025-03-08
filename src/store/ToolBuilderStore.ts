import { makeAutoObservable } from 'mobx';
import { ShowAlertParams } from '@/app/components/AlertProvider';
import { authStore } from './AuthStore';

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
    name: 'custom_function',
    description: '',
    parameters: [],
    code: 'def custom_function():\n    # YOUR CODE HERE\n    return "Function was called"',
}


const getDefaultParameter = () => {
    return {
        name: '',
        type: 'string',
        description: '',
        parameters: [],
    }
}

const getCodeName = (name: string) => {
    return name.replace(/ /g, '_').toLowerCase();
}

const getTestInput = (parameter: any) => {
    if (["string", "number"].includes(parameter.type)) {
        return {
            name: parameter.name,
            type: parameter.type,
            value: ''
        }
    }

    if (parameter.type === "boolean") {
        return {
            name: parameter.name,
            type: parameter.type,
            value: false,
        }
    }

    if (parameter.type === "enum") {
        return {
            name: parameter.name,
            type: parameter.type,
            options: parameter.parameters.map((param: any) => param.name),
            value: parameter.parameters[0].name
        }
    }

    if (parameter.type === "object") {
        return {
            name: parameter.name,
            type: parameter.type,
            value: parameter.parameters.map((param: any) => getTestInput(param))
        }
    }

    if (parameter.type === "array") {
        return {
            name: parameter.name,
            type: parameter.type,
            arrayTypeParameter: parameter.parameters[0],
            value: []
        }
    }
}

class ToolBuilderStore {

    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    tool: Record<string, any> = {};
    testInput: Record<string, any>[] = [];
    toolSaving = false;
    toolDeleting = false;
    functionDeclaration = 'def custom_function():';


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

    getFunctionDeclaration = () => {
        const paramsString = this.tool.parameters.map((param: any) => {
            return `${getCodeName(param.name)}`;
        }).join(', ');
        return `def ${getCodeName(this.tool.name)}(${paramsString}):`;
    }

    setName = (name: string) => {
        this.tool.name = name;
        this.updateCode()
    }

    setDescription = (description: string) => {
        this.tool.description = description;
    }

    getPerameters = (indexArray: number[]) => {
        let perameters = this.tool.parameters;
        for (let i = 0; i < indexArray.length; i++) {
            perameters = perameters[indexArray[i]].parameters;
        }
        return perameters;
    }

    addParameter = (indexArray: number[]) => {
        let parameters = this.getPerameters(indexArray);
        parameters.push(getDefaultParameter());
        this.updateCode()
        this.updateTestInput()
    }

    deleteParameter = (indexArray: number[]) => {
        const parametersArray = indexArray.slice(0, -1);
        const index = indexArray[indexArray.length - 1];

        console.log("parametersArray", parametersArray);
        console.log("index", index);

        let parameters = this.getPerameters(parametersArray);
        parameters.splice(index, 1);
        this.updateCode()
        this.updateTestInput()
    }

    getParameter = (indexArray: number[]) => {
        let parameter = null;
        let parameters = this.tool.parameters;
        for (let i = 0; i < indexArray.length; i++) {
            parameter = parameters[indexArray[i]];
            parameters = parameter.parameters
        }
        return parameter;
    }

    setParameterName = (indexArray: number[], name: string) => {
        const parameter = this.getParameter(indexArray);
        parameter.name = name;
        this.updateCode()
        this.updateTestInput()
    }

    setParameterType = (indexArray: number[], type: string) => {
        const parameter = this.getParameter(indexArray);
        parameter.type = type;
        if (type === 'object' || type === 'array' || type === 'enum') {
            parameter.parameters = [getDefaultParameter()];
        }
        if (type === 'boolean') {
            parameter.test_value = false;
        }
        this.updateTestInput()
    }

    setParameterDescription = (indexArray: number[], description: string) => {
        const parameter = this.getParameter(indexArray);
        parameter.description = description;
    }

    setCode = (code: string) => {
        this.tool.code = code;
    }

    updateCode = () => {
        const codeLines = this.tool.code.split('\n');
        this.functionDeclaration = this.getFunctionDeclaration();
        const newCode = [
            this.functionDeclaration,
            ...codeLines.slice(1),
        ].join('\n');
        this.tool.code = newCode;
    }

    updateTestInput = () => {
        this.testInput = this.tool.parameters.map((param: any) => getTestInput(param))
    }

    getTestInputValue = (indexArray: number[]) => {
        let testInputValue: any = null;
        let testInput: any = this.testInput;
        for (let i = 0; i < indexArray.length; i++) {
            testInputValue = testInput[indexArray[i]];
            testInput = testInputValue.value;
        }
        return testInputValue;
    }

    setTestInputValue = (indexArray: number[], value: string | number | boolean) => {
        const testInputValue = this.getTestInputValue(indexArray);
        testInputValue.value = value;
    }


    addTestArrayItem = (indexArray: number[]) => {
        const testInputValue = this.getTestInputValue(indexArray);
        testInputValue.value.push(getTestInput(testInputValue.arrayTypeParameter));
    }

    deleteTestArrayItem = (indexArray: number[]) => {
        const parametersArray = indexArray.slice(0, -1);
        const index = indexArray[indexArray.length - 1];

        let testInputValue = this.getTestInputValue(parametersArray);
        testInputValue.value.splice(index, 1);
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
import { makeAutoObservable } from 'mobx';
import { ShowAlertParams } from '@/app/components/AlertProvider';
import { authStore } from './AuthStore';
import { AnyType, TestInput, Tool } from '@/types/tools';
import { ParameterDefinition, Parameter } from '@/types/parameterdefinition';
import { createParameterDefinition } from '@/api/parameterdefinition/createParameterDefinition';
import { getParameterDefinition } from '@/api/parameterdefinition/getParameterDefinition';
import { updateParameterDefinition } from '@/api/parameterdefinition/updateParameterDefinition';
import { deleteParameterDefinition } from '@/api/parameterdefinition/deleteParameterDefinition';
import { createTool } from '@/api/tool/createTool';
import { getTool } from '@/api/tool/getTool';
import { updateTool } from '@/api/tool/updateTool';
import { deleteTool } from '@/api/tool/deleteTool';
import { testTool } from '@/api/tool/testTool';

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
    org_id: undefined,
    name: 'custom_function',
    description: '',
    code: 'def custom_function():\n    # YOUR CODE HERE\n    return "Function was called"',
} as Tool;


const getDefaultParameter = (): Parameter => {
    return {
        name: '',
        type: 'string',
        description: '',
        parameters: [],
    }
}

const getCodeName = (name: string): string => {
    return name.replace(/ /g, '_').toLowerCase();
}

const getTestInputFromParam = (parameter: Parameter): TestInput => {
    if (parameter.type === "boolean") {
        return {
            name: parameter.name,
            type: parameter.type,
            value: false,
        }
    } else if (parameter.type === "enum") {
        return {
            name: parameter.name,
            type: parameter.type,
            options: parameter.parameters.map((param: Parameter) => param.name),
            value: parameter.parameters[0].name
        }
    } else if (parameter.type === "object") {
        return {
            name: parameter.name,
            type: parameter.type,
            value: parameter.parameters.map((param: Parameter) => getTestInputFromParam(param))
        }
    } else if (parameter.type === "array") {
        return {
            name: parameter.name,
            type: parameter.type,
            arrayTypeParameter: parameter.parameters[0],
            value: []
        }
    } else {
        return {
            name: parameter.name,
            type: parameter.type,
            value: ''
        }
    }
}

const getTestObject = (testInputs: TestInput[], isArrayItem: boolean = false): Record<string, AnyType> | AnyType => {
    if (isArrayItem) {
        if (testInputs[0].type === 'object') {
            return getTestObject(testInputs[0].value as TestInput[]);
        } else if (testInputs[0].type === 'array') {
            return (testInputs[0].value as TestInput[]).map((testInput: TestInput) => getTestObject([testInput], true));
        } else {
            return testInputs[0].value as string | number | boolean;
        }
    }
    const testObject: Record<string, AnyType> = {};
    testInputs.forEach((testInput: TestInput) => {
        const fieldName = getCodeName(testInput.name);
        if (testInput.type === 'object') {
            testObject[fieldName] = getTestObject(testInput.value as TestInput[]);
        } else if (testInput.type === 'array') {
            testObject[fieldName] = (testInput.value as TestInput[]).map((testInput: TestInput) => getTestObject([testInput], true));
        } else {
            testObject[fieldName] = testInput.value as string | number | boolean;
        }
    });
    return testObject;
}

class ToolBuilderStore {

    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    tool: Tool = defaultTool;
    parameters: Parameter[] = [];
    testInputs: TestInput[] = [];
    toolSaving = false;
    toolDeleting = false;
    functionDeclaration = 'def custom_function():';
    toolExecuting = false;


    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        this.tool = defaultTool;
        this.parameters = [];
        this.testInputs = [];
        this.toolSaving = false;
        this.toolDeleting = false;
        this.functionDeclaration = 'def custom_function():';
        this.toolExecuting = false;
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

    setTool = (tool: Tool) => {
        this.tool = tool;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setToolWithId = async (tool_id: string) => {
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
        return this.tool.tool_id !== '';
    }

    getFunctionDeclaration = (): string => {
        const paramsString = this.parameters.map((param: Parameter) => {
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

    getPerameters = (indexArray: number[]): Parameter[] => {
        let perameters = this.parameters;
        for (let i = 0; i < indexArray.length; i++) {
            perameters = perameters[indexArray[i]].parameters;
        }
        return perameters;
    }

    addParameter = (indexArray: number[]) => {
        const parameters = this.getPerameters(indexArray);
        parameters.push(getDefaultParameter());
        this.updateCode()
        this.updateTestInputs()
    }

    deleteParameter = (indexArray: number[]) => {
        const parametersArray = indexArray.slice(0, -1);
        const index = indexArray[indexArray.length - 1];

        const parameters = this.getPerameters(parametersArray);
        parameters.splice(index, 1);
        this.updateCode()
        this.updateTestInputs()
    }

    getParameter = (indexArray: number[]): Parameter => {
        let parameter = null;
        let parameters = this.parameters;
        for (let i = 0; i < indexArray.length; i++) {
            parameter = parameters[indexArray[i]];
            parameters = parameter.parameters
        }
        if (!parameter) {
            throw new Error('Parameter not found');
        }
        return parameter;
    }

    setParameterName = (indexArray: number[], name: string) => {
        const parameter = this.getParameter(indexArray);
        parameter.name = name;
        this.updateCode()
        this.updateTestInputs()
    }

    setParameterType = (indexArray: number[], type:  "string" | "number" | "boolean" | "object" | "array" | "enum") => {
        const parameter = this.getParameter(indexArray);
        parameter.type = type;
        if (type === 'object' || type === 'array' || type === 'enum') {
            parameter.parameters = [getDefaultParameter()];
        }
        this.updateTestInputs()
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

    updateTestInputs = () => {
        this.testInputs = this.parameters.map((param: Parameter) => getTestInputFromParam(param))
    }

    getTestInput = (indexArray: number[]): TestInput => {
        let testInput: TestInput | null = null;
        let testInputs: TestInput[] = this.testInputs;
        for (let i = 0; i < indexArray.length; i++) {
            testInput = testInputs[indexArray[i]];
            testInputs = testInput.value as TestInput[];
        }
        if (!testInput) {
            throw new Error('Test input not found');
        }
        return testInput;
    }

    setTestInputValue = (indexArray: number[], value: string | number | boolean) => {
        const testInputValue = this.getTestInput(indexArray);
        testInputValue.value = value;
    }


    addTestArrayItem = (indexArray: number[]) => {
        const testInputValue = this.getTestInput(indexArray);
        if (!testInputValue.arrayTypeParameter) {
            throw new Error('Array type parameter not found');
        }
        (testInputValue.value as TestInput[]).push(getTestInputFromParam(testInputValue.arrayTypeParameter));
    }

    deleteTestArrayItem = (indexArray: number[]) => {
        const parametersArray = indexArray.slice(0, -1);
        const index = indexArray[indexArray.length - 1];

        const testInputValue = this.getTestInput(parametersArray);
        (testInputValue.value as TestInput[]).splice(index, 1);
    }

    executeTestInput = async () => {
        try {
            this.toolExecuting = true;
            const payload = {
                function_name: getCodeName(this.tool.name),
                params: getTestObject(this.testInputs) as Record<string, AnyType>,
                code: this.tool.code,
            }
            const result = await testTool(payload);
            this.showAlert({
                title: 'Test Results',
                message: result,
            })
        } catch (error) {
            this.showAlert({
                title: 'Whoops',
                message: (error as Error).message,
            })
        } finally {
            this.toolExecuting = false;
        }
    }

    codifyParameterNames = (parameters: Parameter[]) => {
        parameters.forEach((param: Parameter) => {
            param.name = getCodeName(param.name);
            param.parameters.forEach((param: Parameter) => {
                this.codifyParameterNames(param.parameters);
            });
        });
    }

    codifyNames = () => {
        this.tool.name = getCodeName(this.tool.name);
        this.codifyParameterNames(this.parameters);
    }


    saveTool = async (): Promise<boolean> => {
        try {
            this.toolSaving = true;
            this.codifyNames();
            if (this.isUpdating) {
                //await updateChatPage(this.tool);
            } else {
                // Create Parameter Definition
                const parameterDefinitionPayload = {
                    parameters: this.parameters,
                }
                const parameterDefinition = await createParameterDefinition(parameterDefinitionPayload);

                // Create Tool
                const toolPayload = {
                    ...this.tool,
                    pd_id: parameterDefinition.pd_id,
                }
                console.log("Payload", JSON.stringify(toolPayload, null, 2));
                const tool = await createTool(toolPayload);
                console.log("Response", JSON.stringify(tool, null, 2));
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
import { makeAutoObservable, computed } from "mobx";
import { ShowAlertParams } from "@/app/components/AlertProvider";
import { authStore } from "./AuthStore";
import { Parameter } from "@/types/parameterdefinition";
import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";
import { createParameterDefinition } from "@/api/parameterdefinition/createParameterDefinition";
import { updateParameterDefinition } from "@/api/parameterdefinition/updateParameterDefinition";
import { createSRE } from "@/api/structuredresponseendpoint/createSRE";
import { updateSRE } from "@/api/structuredresponseendpoint/updateSRE";
import { deleteSRE } from "@/api/structuredresponseendpoint/deleteSRE";
import { runSRE } from "@/api/structuredresponseendpoint/runSRE";
import { structuredResponseEndpointsStore } from "./StructuredResponseEndpointStore";
import { AnyType } from "@/types/tools";
import { getParameterDefinition } from "@/api/parameterdefinition/getParameterDefinition";
import { deleteParameterDefinition } from "@/api/parameterdefinition/deleteParameterDefinition";

const defaultSRE: StructuredResponseEndpoint = {
    sre_id: '',
    org_id: '',
    name: '',
    description: '',
    pd_id: '',
    prompt_template: '',
    variable_names: [],
    is_public: false,
    created_at: 0,
    updated_at: 0,
};

const getDefaultParameter = (): Parameter => ({
    name: '',
    type: 'string',
    description: '',
    parameters: [],
});

const getCodeName = (name: string): string => {
    return name.replace(/ /g, '_').toLowerCase();
};

class StructuredResponseEndpointBuilderStore {
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    isNewSme = true;
    useClickedSave = false;
    sre: StructuredResponseEndpoint = defaultSRE;
    parameters: Parameter[] = [];
    isLoadingParameterDefinition = false;
    isLoadingSRE = false;
    sreSaving = false;
    sreDeleting = false;
    isRunningSRE = false;
    runResult: AnyType | undefined = undefined;
    hasUpdatedSRE = false;
    hasUpdatedParameterDefinition = false;

    // Legacy SRE toggle: when true, the user has opted into using variable_names for a legacy SRE
    useVariableNames = false;

    // Test section inputs for new-style SREs (keyed by variable_names entries)
    variableNamesInput: Record<string, string> = {};

    // Test section inputs for legacy SREs (keyed by {variable} placeholders parsed from template)
    templateArgsInput: Record<string, string> = {};

    // Parsed {variable} placeholders from the prompt template — used only for legacy SRE testing
    get templateArgs(): string[] {
        const matches = this.sre.prompt_template?.match(/\{([^}]+)\}/g) || [];
        return matches.map((m) => m.replace(/[{}]/g, ""));
    }

    // True when we are editing an existing SRE that has no variable_names (pre-refactor SRE)
    get isLegacySRE(): boolean {
        return !!this.sre.sre_id && (this.sre.variable_names == null || this.sre.variable_names.length === 0);
    }

    // Whether the variable names UI should be shown
    get showVariableNamesUI(): boolean {
        if (!this.isLegacySRE) return true;
        return this.useVariableNames;
    }

    constructor() {
        makeAutoObservable(this, {
            templateArgs: computed,
            isLegacySRE: computed,
            showVariableNamesUI: computed,
        });
        this.syncTemplateArgsInput();
    }

    syncTemplateArgsInput = () => {
        const filtered: Record<string, string> = {};
        for (const arg of this.templateArgs) {
            filtered[arg] = this.templateArgsInput[arg] ?? '';
        }
        this.templateArgsInput = filtered;
    }

    syncVariableNamesInput = () => {
        const filtered: Record<string, string> = {};
        for (const name of (this.sre.variable_names ?? [])) {
            filtered[name] = this.variableNamesInput[name] ?? '';
        }
        this.variableNamesInput = filtered;
    }

    reset = () => {
        this.isNewSme = true;
        this.useClickedSave = false;
        this.sre = defaultSRE;
        this.parameters = [];
        this.isLoadingParameterDefinition = false;
        this.isLoadingSRE = false;
        this.sreSaving = false;
        this.sreDeleting = false;
        this.isRunningSRE = false;
        this.runResult = undefined;
        this.hasUpdatedSRE = false;
        this.hasUpdatedParameterDefinition = false;
        this.useVariableNames = false;
        this.variableNamesInput = {};
        this.templateArgsInput = {};
        this.syncTemplateArgsInput();
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    initiateNew = () => {
        this.sre = {
            ...defaultSRE,
            org_id: authStore.user?.organizations[0].id || '',
        };
        this.syncTemplateArgsInput();
        this.syncVariableNamesInput();
    }

    setIsNewSme = (isNewSme: boolean) => {
        this.isNewSme = isNewSme;
    }

    setUserClickedSave = (clickedSave: boolean) => {
        this.useClickedSave = clickedSave;
    }

    setUseVariableNames = (value: boolean) => {
        this.useVariableNames = value;
        if (value && (!this.sre.variable_names || this.sre.variable_names.length === 0)) {
            this.sre.variable_names = [];
        }
        this.syncVariableNamesInput();
        this.hasUpdatedSRE = true;
    }

    setSRE = (sre: StructuredResponseEndpoint) => {
        this.sre = sre;
        this.loadParameterDefinition(sre.pd_id);
        this.syncTemplateArgsInput();
        this.syncVariableNamesInput();
    }

    setSREWithId = async (sreId: string) => {
        this.isNewSme = false;
        await structuredResponseEndpointsStore.loadSREs()
        if (!structuredResponseEndpointsStore.sres) {
            this.showAlert({
                title: 'Whoops',
                message: 'There was a problem loading the SREs',
            });
            return;
        }
        const sre = structuredResponseEndpointsStore.sres.find((s) => s.sre_id === sreId);
        if (!sre) {
            this.showAlert({
                title: 'Whoops',
                message: 'Could not find sre',
            });
            return;
        }
        this.setSRE({ ...sre });
    }

    loadParameterDefinition = async (pdId: string) => {
        try {
            this.isLoadingParameterDefinition = true;
            const parameterDefinition = await getParameterDefinition(pdId);
            this.parameters = parameterDefinition.parameters;
        } catch (error) {
            this.showAlert({
                title: 'Whoops',
                message: (error as Error).message,
            })
        } finally {
            this.isLoadingParameterDefinition = false;
        }
    }

    setName = (name: string) => {
        this.sre.name = getCodeName(name);
        this.hasUpdatedSRE = true;
    }

    setDescription = (description: string) => {
        this.sre.description = description;
        this.hasUpdatedSRE = true;
    }

    setPromptTemplate = (template: string) => {
        this.sre.prompt_template = template;
        this.hasUpdatedSRE = true;
        this.syncTemplateArgsInput();
    }

    setIsPublic = (isPublic: boolean) => {
        this.sre.is_public = isPublic;
        this.hasUpdatedSRE = true;
    }

    setModelId = (modelId: string | null) => {
        this.sre.model_id = modelId;
        this.hasUpdatedSRE = true;
    }

    get hasSREId() {
        return this.sre.sre_id !== '';
    }

    codifyNames = () => {
        this.sre.name = getCodeName(this.sre.name);
        this.codifyParameterNames(this.parameters);
    }

    codifyParameterNames = (parameters: Parameter[]) => {
        parameters.forEach((param: Parameter) => {
            param.name = getCodeName(param.name);
            this.codifyParameterNames(param.parameters);
        });
    }

    validate = () => {
        if (!this.sre.name) throw new Error("SRE name is required.");
        if (!this.sre.description) throw new Error("SRE description is required.");
        if (this.parameters.length === 0) {
            throw new Error("At least one parameter is required.");
        }
        this.validateParameterNamesAndDescriptions(this.parameters);

        // Variable names are required for new SREs, or for legacy SREs where the user has enabled them
        const needsVariableNames = !this.isLegacySRE || this.useVariableNames;
        if (needsVariableNames) {
            const names = this.sre.variable_names ?? [];
            if (names.length === 0) {
                throw new Error("At least one variable name is required.");
            }
            if (names.some((n) => !n.trim())) {
                throw new Error("All variable names must be non-empty.");
            }
        }
    }

    validateParameterNamesAndDescriptions = (parameters: Parameter[], isChildOfEnum: boolean = false) => {
        parameters.forEach((param: Parameter) => {
            if (!param.name) throw new Error("All parameters must have a name.");
            if (!param.description && !isChildOfEnum) {
                throw new Error(`Description is required for parameter "${param.name}".`);
            }
            this.validateParameterNamesAndDescriptions(param.parameters, param.type === 'enum');
        });
    }

    // VARIABLE NAME MANAGEMENT

    addVariableName = () => {
        if (!this.sre.variable_names) {
            this.sre.variable_names = [];
        }
        this.sre.variable_names.push('');
        this.syncVariableNamesInput();
        this.hasUpdatedSRE = true;
    }

    removeVariableName = (index: number) => {
        if (this.sre.variable_names) {
            this.sre.variable_names.splice(index, 1);
            this.syncVariableNamesInput();
            this.hasUpdatedSRE = true;
        }
    }

    updateVariableName = (index: number, value: string) => {
        if (this.sre.variable_names) {
            this.sre.variable_names[index] = value;
            this.syncVariableNamesInput();
            this.hasUpdatedSRE = true;
        }
    }

    updateVariableNameInput = (key: string, value: string) => {
        this.variableNamesInput[key] = value;
    }

    // PARAMETER MANAGEMENT

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
        this.hasUpdatedParameterDefinition = true;
    }

    deleteParameter = (indexArray: number[]) => {
        const parametersArray = indexArray.slice(0, -1);
        const index = indexArray[indexArray.length - 1];

        const parameters = this.getPerameters(parametersArray);
        parameters.splice(index, 1);
        this.hasUpdatedParameterDefinition = true;
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
        parameter.name = getCodeName(name);
        this.hasUpdatedParameterDefinition = true;
    }

    setParameterType = (indexArray: number[], type: "string" | "number" | "boolean" | "object" | "array" | "enum") => {
        const parameter = this.getParameter(indexArray);
        parameter.type = type;
        if (type === 'object' || type === 'array' || type === 'enum') {
            parameter.parameters = [getDefaultParameter()];
        } else {
            parameter.parameters = [];
        }
        this.hasUpdatedParameterDefinition = true;
    }

    setParameterDescription = (indexArray: number[], description: string) => {
        const parameter = this.getParameter(indexArray);
        parameter.description = description;
        this.hasUpdatedParameterDefinition = true;
    }

    updateTemplateArg = (key: string, value: string) => {
        this.templateArgsInput[key] = value;
    }

    // CRUD

    saveSRE = async (): Promise<boolean> => {
        try {
            this.sreSaving = true;
            this.codifyNames();
            this.validate();

            // Create or update parameter definition
            if (this.hasUpdatedParameterDefinition) {
                if (this.sre.pd_id) {
                    await updateParameterDefinition({ pd_id: this.sre.pd_id, parameters: this.parameters });
                } else {
                    const pd = await createParameterDefinition({ parameters: this.parameters });
                    this.sre.pd_id = pd.pd_id;
                }
                this.hasUpdatedParameterDefinition = false;
            }

            // Create or update SRE
            if (this.hasUpdatedSRE) {
                if (this.hasSREId) {
                    // When a legacy SRE user has enabled variable names, include them in the update
                    const updatePayload = {
                        ...this.sre,
                        variable_names: this.showVariableNamesUI ? (this.sre.variable_names ?? []) : this.sre.variable_names,
                    };
                    this.sre = await updateSRE(updatePayload);
                } else {
                    const srePayload = {
                        ...this.sre,
                        org_id: undefined,
                        variable_names: this.sre.variable_names ?? [],
                    };
                    this.sre = await createSRE(srePayload);
                }
                this.hasUpdatedSRE = false;
            }
            
            return true;
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message,
            });
            return false;
        } finally {
            this.sreSaving = false;
        }
    }

    deleteSRE = async (): Promise<boolean> => {
        try {
            this.sreDeleting = true;
            try {
                await deleteParameterDefinition(this.sre.pd_id);
            } catch (error) {
                console.log("Error deleting parameter definition", error);
            }
            
            await deleteSRE(this.sre.sre_id);
            return true;
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message,
            });
            return false;
        } finally {
            this.sreDeleting = false;
        }
    }

    // RUNNING

    runSRE = async (): Promise<void> => {
        try {
            this.isRunningSRE = true;

            // New-style SREs use variableNamesInput; legacy SREs use templateArgsInput
            const prompt_args = this.showVariableNamesUI
                ? this.variableNamesInput
                : this.templateArgsInput;

            const result = await runSRE({
                sre_id: this.sre.sre_id,
                prompt_args,
            });
            this.runResult = result;
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message,
            });
        } finally {
            this.isRunningSRE = false;
        }
    }

    clearRunResult = () => {
        this.runResult = undefined;
    }
}

export const sreBuilderStore = new StructuredResponseEndpointBuilderStore();

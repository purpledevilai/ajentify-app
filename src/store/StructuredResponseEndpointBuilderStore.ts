import { makeAutoObservable } from "mobx";
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

    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        console.log("Calling reset");
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
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    initiateNew = () => {
        this.sre = {
            ...defaultSRE,
            org_id: authStore.user?.organizations[0].id || '',
        };
    }

    setIsNewSme = (isNewSme: boolean) => {
        this.isNewSme = isNewSme;
        console.log("Setting is new to:", isNewSme);
    }

    setUserClickedSave = (clickedSave: boolean) => {
        this.useClickedSave = clickedSave;
        console.log("Setting user clicked save to:", clickedSave);
    }

    setSRE = (sre: StructuredResponseEndpoint) => {
        this.sre = sre;
        this.loadParameterDefinition(sre.pd_id);
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

    setIsPublic = (isPublic: boolean) => {
        this.sre.is_public = isPublic;
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

    // CRUD

    saveSRE = async (): Promise<boolean> => {
        try {
            this.sreSaving = true;
            this.codifyNames();
            this.validate();

            // Create or update parameter definition
            if (this.hasUpdatedParameterDefinition) {
                if (this.sre.pd_id) {
                    console.log("Updating parameter definition");
                    await updateParameterDefinition({ pd_id: this.sre.pd_id, parameters: this.parameters });
                } else {
                    console.log("Creating parameter definition");
                    const pd = await createParameterDefinition({ parameters: this.parameters });
                    this.sre.pd_id = pd.pd_id;
                }
                this.hasUpdatedParameterDefinition = false;
            }

            // Create or update SRE
            if (this.hasUpdatedSRE) {
                if (this.hasSREId) {
                    console.log("Updating SRE");
                    this.sre = await updateSRE(this.sre);
                } else {
                    console.log("Creating SRE");
                    const srePayload = {
                        ...this.sre,
                        org_id: undefined
                    }
                    this.sre = await createSRE(srePayload);
                    console.log("Created SRE", JSON.stringify(this.sre));
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
        console.log("Deleting SRE", JSON.stringify(this.sre));
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

    runSRE = async (prompt: string): Promise<void> => {
        try {
            this.isRunningSRE = true;
            const result = await runSRE({
                sre_id: this.sre.sre_id,
                prompt,
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

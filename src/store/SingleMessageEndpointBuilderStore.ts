import { makeAutoObservable } from "mobx";
import { ShowAlertParams } from "@/app/components/AlertProvider";
import { authStore } from "./AuthStore";
import { Parameter } from "@/types/parameterdefinition";
import { SingleMessageEndpoint } from "@/types/singlemessageendpoint";
import { createParameterDefinition } from "@/api/parameterdefinition/createParameterDefinition";
import { updateParameterDefinition } from "@/api/parameterdefinition/updateParameterDefinition";
import { createSME } from "@/api/singlemessageendpoint/createSME";
import { updateSME } from "@/api/singlemessageendpoint/updateSME";
import { deleteSME } from "@/api/singlemessageendpoint/deleteSME";
import { runSME } from "@/api/singlemessageendpoint/runSME";
import { singleMessageEndpointsStore } from "./SingleMessageEndpointStore";
import { AnyType } from "@/types/tools";
import { getParameterDefinition } from "@/api/parameterdefinition/getParameterDefinition";
import { deleteParameterDefinition } from "@/api/parameterdefinition/deleteParameterDefinition";

const defaultSME: SingleMessageEndpoint = {
    sme_id: '',
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

class SingleMessageEndpointBuilderStore {
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    isNewSme = true;
    useClickedSave = false;
    sme: SingleMessageEndpoint = defaultSME;
    parameters: Parameter[] = [];
    isLoadingParameterDefinition = false;
    isLoadingSME = false;
    smeSaving = false;
    smeDeleting = false;
    isRunningSME = false;
    runResult: AnyType | undefined = undefined;
    hasUpdatedSME = false;
    hasUpdatedParameterDefinition = false;

    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        console.log("Calling reset");
        this.isNewSme = true;
        this.useClickedSave = false;
        this.sme = defaultSME;
        this.parameters = [];
        this.isLoadingParameterDefinition = false;
        this.isLoadingSME = false;
        this.smeSaving = false;
        this.smeDeleting = false;
        this.isRunningSME = false;
        this.runResult = undefined;
        this.hasUpdatedSME = false;
        this.hasUpdatedParameterDefinition = false;
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    initiateNew = () => {
        this.sme = {
            ...defaultSME,
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

    setSME = (sme: SingleMessageEndpoint) => {
        this.sme = sme;
        this.loadParameterDefinition(sme.pd_id);
    }

    setSMEWithId = async (smeId: string) => {
        this.isNewSme = false;
        await singleMessageEndpointsStore.loadSMEs()
        if (!singleMessageEndpointsStore.smes) {
            this.showAlert({
                title: 'Whoops',
                message: 'There was a problem loading the SMEs',
            });
            return;
        }
        const sme = singleMessageEndpointsStore.smes.find((s) => s.sme_id === smeId);
        if (!sme) {
            this.showAlert({
                title: 'Whoops',
                message: 'Could not find sme',
            });
            return;
        }
        this.setSME({ ...sme });
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
        this.sme.name = getCodeName(name);
        this.hasUpdatedSME = true;
    }

    setDescription = (description: string) => {
        this.sme.description = description;
        this.hasUpdatedSME = true;
    }

    setIsPublic = (isPublic: boolean) => {
        this.sme.is_public = isPublic;
        this.hasUpdatedSME = true;
    }

    get hasSMEId() {
        return this.sme.sme_id !== '';
    }

    codifyNames = () => {
        this.sme.name = getCodeName(this.sme.name);
        this.codifyParameterNames(this.parameters);
    }

    codifyParameterNames = (parameters: Parameter[]) => {
        parameters.forEach((param: Parameter) => {
            param.name = getCodeName(param.name);
            this.codifyParameterNames(param.parameters);
        });
    }

    validate = () => {
        if (!this.sme.name) throw new Error("SME name is required.");
        if (!this.sme.description) throw new Error("SME description is required.");
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

    saveSME = async (): Promise<boolean> => {
        try {
            this.smeSaving = true;
            this.codifyNames();
            this.validate();

            // Create or update parameter definition
            if (this.hasUpdatedParameterDefinition) {
                if (this.sme.pd_id) {
                    console.log("Updating parameter definition");
                    await updateParameterDefinition({ pd_id: this.sme.pd_id, parameters: this.parameters });
                } else {
                    console.log("Creating parameter definition");
                    const pd = await createParameterDefinition({ parameters: this.parameters });
                    this.sme.pd_id = pd.pd_id;
                }
                this.hasUpdatedParameterDefinition = false;
            }

            // Create or update SME
            if (this.hasUpdatedSME) {
                if (this.hasSMEId) {
                    console.log("Updating SME");
                    this.sme = await updateSME(this.sme);
                } else {
                    console.log("Creating SME");
                    const smePayload = {
                        ...this.sme,
                        org_id: undefined
                    }
                    this.sme = await createSME(smePayload);
                    console.log("Created SME", JSON.stringify(this.sme));
                }
                this.hasUpdatedSME = false;
            }
            
            return true;
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message,
            });
            return false;
        } finally {
            this.smeSaving = false;
        }
    }

    deleteSME = async (): Promise<boolean> => {
        console.log("Deleting SME", JSON.stringify(this.sme));
        try {
            this.smeDeleting = true;
            try {
                await deleteParameterDefinition(this.sme.pd_id);
            } catch (error) {
                console.log("Error deleting parameter definition", error);
            }
            
            await deleteSME(this.sme.sme_id);
            return true;
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message,
            });
            return false;
        } finally {
            this.smeDeleting = false;
        }
    }

    // RUNNING

    runSME = async (message: string): Promise<void> => {
        try {
            this.isRunningSME = true;
            const result = await runSME({
                sme_id: this.sme.sme_id,
                message,
            });
            this.runResult = result;
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message,
            });
        } finally {
            this.isRunningSME = false;
        }
    }

    clearRunResult = () => {
        this.runResult = undefined;
    }
}

export const smeBuilderStore = new SingleMessageEndpointBuilderStore();

import { makeAutoObservable } from "mobx";
import { Model } from "@/types/model";
import { getModels } from "@/api/model/getModels";

class ModelsStore {
    models: Model[] = [];
    isLoading = false;
    hasLoaded = false;
    modelsError: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    loadModels = async (force = false) => {
        if (this.hasLoaded && !force) return;
        try {
            this.modelsError = null;
            this.isLoading = true;
            this.models = await getModels();
            this.hasLoaded = true;
        } catch (error) {
            this.modelsError = (error as Error).message;
        } finally {
            this.isLoading = false;
        }
    }

    getModelByName = (modelName: string): Model | undefined => {
        return this.models.find(m => m.model === modelName);
    }

    isAnthropicModel = (modelId: string | null | undefined): boolean => {
        if (!modelId) return false;
        const model = this.getModelByName(modelId);
        return model?.model_provider === "anthropic";
    }
}

export const modelsStore = new ModelsStore();

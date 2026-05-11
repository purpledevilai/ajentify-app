import { makeAutoObservable } from 'mobx';
import { getStages } from '@/api/stage/getStages';
import { createStage as createStageApi, CreateStagePayload } from '@/api/stage/createStage';
import { updateStage as updateStageApi, UpdateStagePayload } from '@/api/stage/updateStage';
import { deleteStage as deleteStageApi, DeleteStageMode } from '@/api/stage/deleteStage';
import { Stage } from '@/types/stage';

class StagesStore {
    stagesError: string | null = null;
    createStageError: string | null = null;
    updateStageError: string | null = null;
    deleteStageError: string | null = null;
    stages: Stage[] | undefined = undefined;
    stagesLoading = true;

    constructor() {
        makeAutoObservable(this);
    }

    /**
     * Cheap helper used by resource list pages to decide whether to render the
     * `stage` / `logical_name` columns. Avoids a fetch when the cache is warm.
     */
    get hasAnyStage(): boolean {
        return Array.isArray(this.stages) && this.stages.length > 0;
    }

    async loadStages(force: boolean = false) {
        if (!force && this.stages) {
            return;
        }

        try {
            this.stagesError = null;
            this.stagesLoading = true;
            this.stages = await getStages();
        } catch (error) {
            this.stagesError = (error as Error).message;
        } finally {
            this.stagesLoading = false;
        }
    }

    async createStage(payload: CreateStagePayload): Promise<Stage | undefined> {
        try {
            this.createStageError = null;
            const stage = await createStageApi(payload);
            this.stages = [...(this.stages ?? []), stage];
            return stage;
        } catch (error) {
            this.createStageError = (error as Error).message;
            return undefined;
        }
    }

    async updateStage(stageId: string, payload: UpdateStagePayload): Promise<Stage | undefined> {
        try {
            this.updateStageError = null;
            const updated = await updateStageApi(stageId, payload);
            if (this.stages) {
                this.stages = this.stages.map((s) => (s.stage_id === stageId ? updated : s));
            }
            return updated;
        } catch (error) {
            this.updateStageError = (error as Error).message;
            return undefined;
        }
    }

    async deleteStage(stageId: string, mode: DeleteStageMode): Promise<boolean> {
        try {
            this.deleteStageError = null;
            await deleteStageApi(stageId, mode);
            if (this.stages) {
                this.stages = this.stages.filter((s) => s.stage_id !== stageId);
            }
            return true;
        } catch (error) {
            this.deleteStageError = (error as Error).message;
            return false;
        }
    }

    reset = () => {
        this.stages = undefined;
    }
}

export const stagesStore = new StagesStore();

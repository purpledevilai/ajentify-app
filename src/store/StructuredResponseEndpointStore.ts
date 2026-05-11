import { makeAutoObservable } from 'mobx';
import { StructuredResponseEndpoint } from '@/types/structuredresponseendpoint';
import { getSREs } from '@/api/structuredresponseendpoint/getSREs';

class StructuredResponseEndpointsStore {
    sresError: string | null = null;
    sres: StructuredResponseEndpoint[] | undefined = undefined;
    sresLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    async loadSREs(force: boolean = false) {
        if (!force && this.sres) {
            return;
        }

        try {
            this.sresError = null;
            this.sresLoading = true;
            this.sres = await getSREs();
        } catch (error) {
            this.sresError = (error as Error).message;
        } finally {
            this.sresLoading = false;
        }
    }

    reset = () => {
        this.sres = undefined;
    }
}

export const structuredResponseEndpointsStore = new StructuredResponseEndpointsStore();

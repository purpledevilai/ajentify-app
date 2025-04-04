import { makeAutoObservable } from 'mobx';
import { ShowAlertParams } from "@/app/components/AlertProvider";
import { StructuredResponseEndpoint } from '@/types/structuredresponseendpoint';
import { getSREs } from '@/api/structuredresponseendpoint/getSREs';

class StructuredResponseEndpointsStore {
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    sres: StructuredResponseEndpoint[] | undefined = undefined;
    sresLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    async loadSREs(force: boolean = false) {
        if (!force && this.sres) {
            return;
        }

        try {
            this.sresLoading = true;
            this.sres = await getSREs();
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message
            });
        } finally {
            this.sresLoading = false;
        }
    }

    reset = () => {
        this.sres = undefined;
    }
}

export const structuredResponseEndpointsStore = new StructuredResponseEndpointsStore();

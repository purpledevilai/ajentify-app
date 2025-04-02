import { makeAutoObservable } from 'mobx';
import { ShowAlertParams } from "@/app/components/AlertProvider";
import { SingleMessageEndpoint } from '@/types/singlemessageendpoint';
import { getSMEs } from '@/api/singlemessageendpoint/getSMEs';

class SingleMessageEndpointsStore {
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    smes: SingleMessageEndpoint[] | undefined = undefined;
    smesLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    async loadSMEs(force: boolean = false) {
        if (!force && this.smes) {
            return;
        }

        try {
            this.smesLoading = true;
            this.smes = await getSMEs();
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message
            });
        } finally {
            this.smesLoading = false;
        }
    }

    reset = () => {
        this.smes = undefined;
    }
}

export const singleMessageEndpointsStore = new SingleMessageEndpointsStore();

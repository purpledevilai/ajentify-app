import { makeAutoObservable } from 'mobx';
import { ShowAlertParams } from '@/app/components/AlertProvider';
import { Integration } from '@/types/integration';
import { getIntegrations } from '@/api/integration/getIntegrations';

class IntegrationsStore {
    integrations: Integration[] | undefined = undefined;
    integrationsLoading = true;
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;

    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        this.integrations = undefined;
    };

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    };

    async loadIntegrations(force: boolean = false) {
        if (!force && this.integrations) {
            return;
        }
        try {
            this.integrationsLoading = true;
            this.integrations = await getIntegrations();
        } catch (error) {
            this.showAlert({
                title: 'Whoops',
                message: (error as Error).message,
            });
        } finally {
            this.integrationsLoading = false;
        }
    }
}

export const integrationsStore = new IntegrationsStore();

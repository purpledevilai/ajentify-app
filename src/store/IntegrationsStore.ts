import { makeAutoObservable } from 'mobx';
import { getIntegrations } from '@/api/integration/getIntegrations';
import { deleteIntegration } from '@/api/integration/deleteIntegration';
import { Integration } from '@/types/integration';
import { ShowAlertParams } from "@/app/components/AlertProvider";

class IntegrationsStore {
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    integrations: Integration[] | undefined = undefined;
    integrationsLoading = true;
    deleteLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    async loadIntegrations(force: boolean = false) {
        if (!force && this.integrations) {
            return;
        }

        try {
            this.integrationsLoading = true;
            this.integrations = await getIntegrations();
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message
            });
        } finally {
            this.integrationsLoading = false;
        }
    }

    async deleteIntegration(integrationId: string) {
        try {
            this.deleteLoading = true;
            await deleteIntegration(integrationId);
            this.integrations = this.integrations?.filter(i => i.integration_id !== integrationId);
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message
            });
        } finally {
            this.deleteLoading = false;
        }
    }

    getGmailIntegrations(): Integration[] {
        return this.integrations?.filter(i => i.type === 'gmail') || [];
    }

    reset = () => {
        this.integrations = undefined;
    }
}

export const integrationsStore = new IntegrationsStore();


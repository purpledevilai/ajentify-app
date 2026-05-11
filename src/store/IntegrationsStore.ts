import { makeAutoObservable } from 'mobx';
import { getIntegrations } from '@/api/integration/getIntegrations';
import { deleteIntegration } from '@/api/integration/deleteIntegration';
import { Integration } from '@/types/integration';

export class IntegrationsStore {
    integrationsError: string | null = null;
    deleteIntegrationError: string | null = null;
    integrations: Integration[] | undefined = undefined;
    integrationsLoading = true;
    deleteLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    async loadIntegrations(force: boolean = false) {
        if (!force && this.integrations) {
            return;
        }

        try {
            this.integrationsError = null;
            this.integrationsLoading = true;
            this.integrations = await getIntegrations();
        } catch (error) {
            this.integrationsError = (error as Error).message;
        } finally {
            this.integrationsLoading = false;
        }
    }

    async deleteIntegration(integrationId: string) {
        try {
            this.deleteIntegrationError = null;
            this.deleteLoading = true;
            await deleteIntegration(integrationId);
            this.integrations = this.integrations?.filter(i => i.integration_id !== integrationId);
        } catch (error) {
            this.deleteIntegrationError = (error as Error).message;
        } finally {
            this.deleteLoading = false;
        }
    }

    getGmailIntegrations(): Integration[] {
        return this.integrations?.filter(i => i.type === 'gmail') || [];
    }

    getOutlookIntegrations(): Integration[] {
        return this.integrations?.filter(i => i.type === 'outlook') || [];
    }

    getGoogleCalendarIntegrations(): Integration[] {
        return this.integrations?.filter(i => i.type === 'google_calendar') || [];
    }

    reset = () => {
        this.integrations = undefined;
    }
}


import { makeAutoObservable } from 'mobx';
import { ShowAlertParams } from '@/app/components/AlertProvider';

class IntegrationBuilderStore {
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    type: string = 'jira';
    isNew = false;

    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        this.type = 'jira';
        this.isNew = false;
    };

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    };

    setType = (type: string) => {
        this.type = type;
    };
}

export const integrationBuilderStore = new IntegrationBuilderStore();

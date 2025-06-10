import { makeAutoObservable } from 'mobx';
import { getJsonDocuments } from '@/api/jsondocument/getJsonDocuments';
import { JsonDocument } from '@/types/jsondocument';
import { ShowAlertParams } from "@/app/components/AlertProvider";

class JsonDocumentsStore {
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    documents: JsonDocument[] | undefined = undefined;
    documentsLoading = true;

    constructor() {
        makeAutoObservable(this);
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    async loadDocuments(force: boolean = false) {
        if (!force && this.documents) {
            return;
        }

        try {
            this.documentsLoading = true;
            this.documents = await getJsonDocuments();
        } catch (error) {
            this.showAlert({
                title: "Whoops",
                message: (error as Error).message
            })
        } finally {
            this.documentsLoading = false;
        }
    }

    reset = () => {
        this.documents = undefined;
    }
}

export const jsonDocumentsStore = new JsonDocumentsStore();

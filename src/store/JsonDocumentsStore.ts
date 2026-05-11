import { makeAutoObservable } from 'mobx';
import { getJsonDocuments } from '@/api/jsondocument/getJsonDocuments';
import { JsonDocument } from '@/types/jsondocument';

class JsonDocumentsStore {
    documentsError: string | null = null;
    documents: JsonDocument[] | undefined = undefined;
    documentsLoading = true;

    constructor() {
        makeAutoObservable(this);
    }

    async loadDocuments(force: boolean = false) {
        if (!force && this.documents) {
            return;
        }

        try {
            this.documentsError = null;
            this.documentsLoading = true;
            this.documents = await getJsonDocuments();
        } catch (error) {
            this.documentsError = (error as Error).message;
        } finally {
            this.documentsLoading = false;
        }
    }

    reset = () => {
        this.documents = undefined;
    }
}

export const jsonDocumentsStore = new JsonDocumentsStore();

import { makeAutoObservable } from 'mobx';
import { JsonDocument } from '@/types/jsondocument';
import { ShowAlertParams } from '@/app/components/AlertProvider';
import { createJsonDocument } from '@/api/jsondocument/createJsonDocument';
import { updateJsonDocument } from '@/api/jsondocument/updateJsonDocument';
import { deleteJsonDocument } from '@/api/jsondocument/deleteJsonDocument';

const defaultDocument: JsonDocument = {
    document_id: '',
    name: '',
    data: {},
};

class JsonDocumentBuilderStore {
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    document: JsonDocument = { ...defaultDocument };
    dataString = '{}';
    dataError: string | null = null;
    isNewDocument = false;
    saving = false;
    deleting = false;

    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        this.document = { ...defaultDocument };
        this.dataString = '{}';
        this.dataError = null;
        this.isNewDocument = false;
        this.saving = false;
        this.deleting = false;
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    setIsNewDocument(isNew: boolean) {
        this.isNewDocument = isNew;
    }

    setDocument(document: JsonDocument) {
        this.document = document;
        this.dataString = JSON.stringify(document.data, null, 2);
        this.dataError = null;
    }

    setName(name: string) {
        this.document.name = name;
    }

    setDataString(value: string) {
        this.dataString = value;
        try {
            this.document.data = JSON.parse(value);
            this.dataError = null;
        } catch (err) {
            this.dataError = (err as Error).message;
        }
    }

    async createDocument() {
        try {
            this.saving = true;
            const doc = await createJsonDocument({
                name: this.document.name,
                data: this.document.data,
            });
            this.document = doc;
        } catch (error) {
            this.showAlert({
                title: 'Error',
                message: (error as Error).message,
            })
        } finally {
            this.saving = false;
        }
    }

    async updateDocument() {
        try {
            this.saving = true;
            const doc = await updateJsonDocument({
                document_id: this.document.document_id,
                name: this.document.name,
                data: this.document.data,
            });
            this.document = doc;
        } catch (error) {
            this.showAlert({
                title: 'Error',
                message: (error as Error).message,
            })
        } finally {
            this.saving = false;
        }
    }

    async deleteDocument() {
        try {
            this.deleting = true;
            await deleteJsonDocument(this.document.document_id);
        } catch (error) {
            this.showAlert({
                title: 'Error',
                message: (error as Error).message,
            })
        } finally {
            this.deleting = false;
        }
    }

    async onSaveDocumentClick() {
        if (this.document.document_id) {
            await this.updateDocument();
        } else {
            await this.createDocument();
        }
        this.isNewDocument = false;
    }
}

export const jsonDocumentBuilderStore = new JsonDocumentBuilderStore();

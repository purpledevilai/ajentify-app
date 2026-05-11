import { makeAutoObservable } from 'mobx';
import { JsonDocument } from '@/types/jsondocument';
import { createJsonDocument } from '@/api/jsondocument/createJsonDocument';
import { updateJsonDocument } from '@/api/jsondocument/updateJsonDocument';
import { deleteJsonDocument } from '@/api/jsondocument/deleteJsonDocument';

const defaultDocument: JsonDocument = {
    document_id: '',
    name: '',
    data: {},
};

export class JsonDocumentBuilderStore {
    document: JsonDocument = { ...defaultDocument };
    dataString = '{}';
    dataError: string | null = null;
    isNewDocument = false;
    saving = false;
    deleting = false;

    // API-action error fields
    createDocumentError: string | null = null;
    updateDocumentError: string | null = null;
    deleteDocumentError: string | null = null;

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
        this.createDocumentError = null;
        this.updateDocumentError = null;
        this.deleteDocumentError = null;
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

    setStageAssignment(stageId: string | null, logicalName: string | null) {
        // Carry explicit values (incl. null) so the next save serializes them
        // and the backend's model_fields_set treats explicit-null as a detach.
        this.document.stage_id = stageId;
        this.document.logical_name = logicalName;
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
            this.createDocumentError = null;
            this.saving = true;
            const doc = await createJsonDocument({
                name: this.document.name,
                data: this.document.data,
            });
            this.document = doc;
        } catch (error) {
            this.createDocumentError = (error as Error).message;
        } finally {
            this.saving = false;
        }
    }

    async updateDocument() {
        try {
            this.updateDocumentError = null;
            this.saving = true;
            const doc = await updateJsonDocument({
                document_id: this.document.document_id,
                name: this.document.name,
                data: this.document.data,
                stage_id: this.document.stage_id ?? null,
                logical_name: this.document.logical_name ?? null,
            });
            this.document = doc;
        } catch (error) {
            this.updateDocumentError = (error as Error).message;
        } finally {
            this.saving = false;
        }
    }

    async deleteDocument() {
        try {
            this.deleteDocumentError = null;
            this.deleting = true;
            await deleteJsonDocument(this.document.document_id);
        } catch (error) {
            this.deleteDocumentError = (error as Error).message;
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


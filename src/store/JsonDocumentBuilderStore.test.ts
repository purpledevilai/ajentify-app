import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JsonDocumentBuilderStore } from './JsonDocumentBuilderStore';

vi.mock('@/api/jsondocument/createJsonDocument', () => ({ createJsonDocument: vi.fn() }));
vi.mock('@/api/jsondocument/updateJsonDocument', () => ({ updateJsonDocument: vi.fn() }));
vi.mock('@/api/jsondocument/deleteJsonDocument', () => ({ deleteJsonDocument: vi.fn() }));

describe('JsonDocumentBuilderStore', () => {
    let store: JsonDocumentBuilderStore;

    beforeEach(() => {
        store = new JsonDocumentBuilderStore();
    });

    it('constructs without throwing', () => {
        expect(store).toBeDefined();
    });

    it('has correct default values after construction', () => {
        expect(store.document.document_id).toBe('');
        expect(store.document.name).toBe('');
        expect(store.dataString).toBe('{}');
        expect(store.isNewDocument).toBe(false);
        expect(store.saving).toBe(false);
        expect(store.deleting).toBe(false);
    });

    it('setIsNewDocument updates the flag', () => {
        store.setIsNewDocument(true);
        expect(store.isNewDocument).toBe(true);
    });

    it('setDocument updates the document and dataString', () => {
        const doc = { document_id: 'doc1', name: 'Test', data: { key: 'value' } };
        store.setDocument(doc);
        expect(store.document).toEqual(doc);
        expect(store.dataString).toBe(JSON.stringify(doc.data, null, 2));
        expect(store.dataError).toBeNull();
    });

    it('setDataString updates dataString and parses valid JSON', () => {
        store.setDataString('{"foo": "bar"}');
        expect(store.dataString).toBe('{"foo": "bar"}');
        expect(store.document.data).toEqual({ foo: 'bar' });
        expect(store.dataError).toBeNull();
    });

    it('setDataString sets dataError for invalid JSON', () => {
        store.setDataString('not-valid-json');
        expect(store.dataError).not.toBeNull();
    });

    it('reset returns all fields to defaults', () => {
        store.setIsNewDocument(true);
        store.setName('Test Document');
        store.reset();
        expect(store.document.name).toBe('');
        expect(store.isNewDocument).toBe(false);
        expect(store.dataString).toBe('{}');
    });
});

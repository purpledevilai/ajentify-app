import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StructuredResponseEndpointBuilderStore } from './StructuredResponseEndpointBuilderStore';
import { ParameterDefinitionsStore } from './ParameterDefinitionsStore';

vi.mock('@/api/structuredresponseendpoint/getSREs', () => ({ getSREs: vi.fn() }));
vi.mock('@/api/parameterdefinition/getParameterDefinitions', () => ({ getParameterDefinitions: vi.fn() }));
vi.mock('@/api/parameterdefinition/getParameterDefinition', () => ({ getParameterDefinition: vi.fn() }));

describe('StructuredResponseEndpointBuilderStore', () => {
    let parameterDefinitions: ParameterDefinitionsStore;
    let store: StructuredResponseEndpointBuilderStore;

    beforeEach(() => {
        parameterDefinitions = new ParameterDefinitionsStore();
        store = new StructuredResponseEndpointBuilderStore({ parameterDefinitions });
    });

    it('constructs without throwing', () => {
        expect(store).toBeDefined();
    });

    it('initiateNew sets isNewSme and resets to default SRE', () => {
        store.initiateNew();
        expect(store.isNewSme).toBe(true);
        expect(store.sre.sre_id).toBe('');
        expect(store.sre.org_id).toBe('');
    });

    it('uses parameterDefinitions.ensurePdId when loading a parameter definition', async () => {
        const mockEnsurePdId = vi.fn().mockResolvedValue(undefined);
        const mockParamDefs = {
            parameterDefinitionsError: null,
            ensurePdId: mockEnsurePdId,
        } as unknown as ParameterDefinitionsStore;
        const testStore = new StructuredResponseEndpointBuilderStore({ parameterDefinitions: mockParamDefs });
        await testStore.loadParameterDefinition('test-pd-id');
        expect(mockEnsurePdId).toHaveBeenCalledWith('test-pd-id');
    });

    it('setName codifies the name and marks hasUpdatedSRE', () => {
        store.initiateNew();
        store.setName('My SRE Name');
        expect(store.sre.name).toBe('my_sre_name');
        expect(store.hasUpdatedSRE).toBe(true);
    });
});

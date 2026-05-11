import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToolBuilderStore } from './ToolBuilderStore';
import { ParameterDefinitionsStore } from './ParameterDefinitionsStore';

vi.mock('@/api/tool/getTools', () => ({ getTools: vi.fn() }));
vi.mock('@/api/parameterdefinition/getParameterDefinitions', () => ({ getParameterDefinitions: vi.fn() }));
vi.mock('@/api/parameterdefinition/getParameterDefinition', () => ({ getParameterDefinition: vi.fn() }));

describe('ToolBuilderStore', () => {
    let parameterDefinitions: ParameterDefinitionsStore;
    let store: ToolBuilderStore;

    beforeEach(() => {
        parameterDefinitions = new ParameterDefinitionsStore();
        store = new ToolBuilderStore({ parameterDefinitions });
    });

    it('constructs without throwing', () => {
        expect(store).toBeDefined();
    });

    it('initiates a new tool with default values', () => {
        store.initiateNew();
        expect(store.tool).toBeDefined();
        expect(store.tool.name).toBe('custom_function');
        expect(store.tool.org_id).toBe('');
    });

    it('uses parameterDefinitions.ensurePdId when loading a parameter definition', async () => {
        const mockEnsurePdId = vi.fn().mockResolvedValue(undefined);
        const mockParamDefs = {
            parameterDefinitionsError: null,
            ensurePdId: mockEnsurePdId,
        } as unknown as ParameterDefinitionsStore;
        const testStore = new ToolBuilderStore({ parameterDefinitions: mockParamDefs });
        await testStore.loadParameterDefinition('test-pd-id');
        expect(mockEnsurePdId).toHaveBeenCalledWith('test-pd-id');
    });

    it('adding a parameter updates the function declaration', () => {
        store.initiateNew();
        const initialDeclaration = store.functionDeclaration;
        store.addParameter([]);
        store.setParameterName([0], 'my_param');
        expect(store.functionDeclaration).not.toBe(initialDeclaration);
        expect(store.functionDeclaration).toContain('my_param');
    });

    it('switching to client-side tool clears code and disables pass_context', () => {
        store.initiateNew();
        store.setIsClientSideTool(true);
        expect(store.tool.code).toBeUndefined();
        expect(store.tool.pass_context).toBe(false);
        expect(store.tool.is_async).toBe(false);
    });
});

import { describe, it, expect } from 'vitest';
import { RootStore } from './RootStore';

describe('RootStore', () => {
    it('constructs without throwing', () => {
        expect(() => new RootStore()).not.toThrow();
    });

    it('has all expected fields defined after construction', () => {
        const root = new RootStore();
        expect(root.parameterDefinitions).toBeDefined();
        expect(root.models).toBeDefined();
        expect(root.contexts).toBeDefined();
        expect(root.integrations).toBeDefined();
        expect(root.stages).toBeDefined();
        expect(root.tools).toBeDefined();
        expect(root.agents).toBeDefined();
        expect(root.jsonDocuments).toBeDefined();
        expect(root.sres).toBeDefined();
        expect(root.createTeam).toBeDefined();
        expect(root.chat).toBeDefined();
        expect(root.auth).toBeDefined();
    });

    it('resetAll does not throw and leaves fields intact', () => {
        const root = new RootStore();
        expect(() => root.resetAll()).not.toThrow();
        // Fields should still be defined after reset
        expect(root.parameterDefinitions).toBeDefined();
        expect(root.models).toBeDefined();
        expect(root.contexts).toBeDefined();
        expect(root.integrations).toBeDefined();
        expect(root.stages).toBeDefined();
        expect(root.tools).toBeDefined();
        expect(root.agents).toBeDefined();
        expect(root.jsonDocuments).toBeDefined();
        expect(root.sres).toBeDefined();
        expect(root.createTeam).toBeDefined();
        expect(root.chat).toBeDefined();
        expect(root.auth).toBeDefined();
    });
});

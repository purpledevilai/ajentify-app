import { describe, it, expect } from 'vitest';
import { AuthFlowStore } from './AuthFlowStore';

describe('AuthFlowStore', () => {
    it('constructs without throwing', () => {
        expect(() => new AuthFlowStore()).not.toThrow();
    });

    it('has all expected fields defined after construction', () => {
        const store = new AuthFlowStore();
        expect(store.auth).toBeDefined();
        expect(store.signUp).toBeDefined();
    });

    it('auth.reset() does not throw', () => {
        const store = new AuthFlowStore();
        expect(() => store.auth.reset()).not.toThrow();
        // Fields should still be defined after reset
        expect(store.auth).toBeDefined();
        expect(store.signUp).toBeDefined();
    });
});

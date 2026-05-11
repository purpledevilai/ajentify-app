import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentBuilderStore } from './AgentBuilderStore';

vi.mock('@/api/agent/getAgents', () => ({ getAgents: vi.fn() }));
vi.mock('@/api/tool/getTools', () => ({ getTools: vi.fn() }));
vi.mock('@/api/agent/createAgent', () => ({ createAgent: vi.fn() }));
vi.mock('@/api/agent/updateAgent', () => ({ updateAgent: vi.fn() }));
vi.mock('@/api/agent/deleteAgent', () => ({ deleteAgent: vi.fn() }));

describe('AgentBuilderStore', () => {
    let store: AgentBuilderStore;

    beforeEach(() => {
        store = new AgentBuilderStore();
    });

    it('constructs without throwing', () => {
        expect(store).toBeDefined();
    });

    it('has correct default values after construction', () => {
        expect(store.isNewAgent).toBe(false);
        expect(store.currentAgent.agent_id).toBe('');
        expect(store.hasUpdates).toBe(false);
        expect(store.tools).toEqual([]);
    });

    it('setIsNewAgent updates the flag', () => {
        store.setIsNewAgent(true);
        expect(store.isNewAgent).toBe(true);
        store.setIsNewAgent(false);
        expect(store.isNewAgent).toBe(false);
    });

    it('setStringField updates the field and marks hasUpdates', () => {
        store.setStringField('agent_name', 'Test Agent');
        expect(store.currentAgent.agent_name).toBe('Test Agent');
        expect(store.hasUpdates).toBe(true);
    });

    it('reset returns all fields to defaults', () => {
        store.setStringField('agent_name', 'Test Agent');
        store.setIsNewAgent(true);
        store.reset();
        expect(store.currentAgent.agent_name).toBe('');
        expect(store.isNewAgent).toBe(false);
        expect(store.hasUpdates).toBe(false);
    });
});

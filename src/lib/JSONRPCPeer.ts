/* eslint-disable */
import { v4 as uuidv4 } from 'uuid';
import { tillTrue } from './tilltrue';

interface JSONRPCResponse {
    id: string;
    result: Record<string, any>;
}

type Handler = (...args: any[]) => Promise<any> | void;

export class JSONRPCPeer {
    private sender: (msg: string) => void;
    private responseQueue: Record<string, JSONRPCResponse | undefined> = {};
    private handlerRegistry: Record<string, Handler> = {};

    constructor(sender: (msg: string) => void) {
        this.sender = sender;
    }

    on(method: string, handler: Handler): void {
        this.handlerRegistry[method] = handler;
    }

    async call(
        method: string,
        params: Record<string, any>,
        awaitResponse = false,
        timeout = 5000
    ): Promise<Record<string, any> | void> {
        const id = awaitResponse ? uuidv4() : undefined;

        this.sender(JSON.stringify({ method, params, id }));

        if (!awaitResponse || !id) return;

        this.responseQueue[id] = undefined;

        const success = await tillTrue(() => this.responseQueue[id] !== undefined, timeout);
        if (!success) throw new Error(`Timeout waiting for response to ${method}`);

        const response = this.responseQueue[id] as JSONRPCResponse | undefined;
        delete this.responseQueue[id];
        if (!response) {
            throw new Error(`No response for ${method}`);
        }

        if (response?.result?.error) {
            throw new Error(`Error in response to ${method}: ${response.result.error}`);
        }

        return response?.result;
    }

    async handleMessage(message: string): Promise<void> {
        let parsed;
        try {
            parsed = JSON.parse(message);
        } catch (e) {
            console.error('Failed to parse message', e);
            return;
        }

        if (parsed.method && parsed.params) {
            const handler = this.handlerRegistry[parsed.method];
            if (!handler) {
                console.warn('No handler for method:', parsed.method);
                return;
            }

            if (!parsed.id) {
                await handler(...Object.values(parsed.params));
                return;
            }

            try {
                const result = await handler(...Object.values(parsed.params));
                this.sender(JSON.stringify({ id: parsed.id, result }));
            } catch (e: any) {
                this.sender(JSON.stringify({ id: parsed.id, result: { error: e.message } }));
            }
            return;
        }

        if (!parsed.id || !(parsed.id in this.responseQueue)) {
            console.warn('Unknown response ID', parsed);
            return;
        }

        this.responseQueue[parsed.id] = {
            id: parsed.id,
            result: parsed.result ?? {},
        };
    }
}

/* eslint-disable */
import { JSONRPCPeer } from '../../lib/JSONRPCPeer';
import { SimpleWebSocketClient } from '../../lib/SimpleWebSocketClient';

export class TokenStreamingService {
    private tokenStreamingUrl: string;
    private contextId: string;
    private accessToken: string;
    private websocket?: SimpleWebSocketClient;
    private tokenStreamingService?: JSONRPCPeer;
    private tokenQueue: string[] = [];
    private queueListeners: ((token: string) => void)[] = [];

    private onTokenCallback?: (token: string) => void;
    private onToolCallCallback?: (id: string, name: string, input: string) => void;
    private onToolResponseCallback?: (id: string, name: string, output: string) => void;
    private onEventsCallback?: (events: any[], responseId: string) => void;

    constructor(tokenStreamingUrl: string, contextId: string, accessToken: string) {
        this.tokenStreamingUrl = tokenStreamingUrl;
        this.contextId = contextId;
        this.accessToken = accessToken;
    }

    async connect(): Promise<void> {
        this.websocket = new SimpleWebSocketClient(this.tokenStreamingUrl);
        this.tokenStreamingService = new JSONRPCPeer((msg) =>
            this.websocket!.send(msg)
        );

        this.tokenStreamingService.on('on_token', this._onToken.bind(this));
        this.tokenStreamingService.on('on_tool_call', this._onToolCall.bind(this));
        this.tokenStreamingService.on('on_tool_response', this._onToolResponse.bind(this));
        this.tokenStreamingService.on('on_events', this._onEvents.bind(this));

        this.websocket.setOnMessage((msg) => {
            this.tokenStreamingService!.handleMessage(msg);
        });

        await this.websocket.connect();
        console.log(`Connected to token streaming service at ${this.tokenStreamingUrl}`);

        await this.tokenStreamingService.call('connect_to_context', {
            context_id: this.contextId,
            access_token: this.accessToken,
        }, true);
    }

    setOnToken(cb: (token: string) => void) {
        this.onTokenCallback = cb;
    }

    setOnToolCall(cb: (id: string, name: string, input: string) => void) {
        this.onToolCallCallback = cb;
    }

    setOnToolResponse(cb: (id: string, name: string, output: string) => void) {
        this.onToolResponseCallback = cb;
    }

    setOnEvents(cb: (events: any[], responseId: string) => void) {
        this.onEventsCallback = cb;
    }

    private async _onToken(token: string, responseId: string): Promise<void> {
        this.onTokenCallback?.(token);
    }

    private async _onToolCall(id: string, name: string, input: string): Promise<void> {
        this.onToolCallCallback?.(id, name, input);
    }

    private async _onToolResponse(id: string, name: string, output: string): Promise<void> {
        this.onToolResponseCallback?.(id, name, output);
    }

    private async _onEvents(events: any[], responseId: string): Promise<void> {
        this.onEventsCallback?.(events, responseId);
    }

    async addMessage(message: string): Promise<void> {
        await this.tokenStreamingService?.call('add_message', { message });
    }

    close(): void {
        this.websocket?.close();
        console.log('Closed token streaming service connection');
    }
}

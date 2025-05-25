export class SimpleWebSocketClient {
    private url: string;
    private socket?: WebSocket;
    private onMessageCallback?: (msg: string) => void;
    private onCloseCallback?: () => void;

    constructor(url: string) {
        this.url = url;
    }

    setOnMessage(callback: (msg: string) => void): void {
        this.onMessageCallback = callback;
    }

    setOnClose(callback: () => void): void {
        this.onCloseCallback = callback;
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => resolve();

            this.socket.onerror = (err) => {
                console.error('WebSocket error:', err);
                reject(err);
            };

            this.socket.onmessage = (event) => {
                if (this.onMessageCallback) {
                    this.onMessageCallback(event.data);
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket closed.');
                if (this.onCloseCallback) {
                    this.onCloseCallback();
                }
            };
        });
    }

    async send(message: string): Promise<void> {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.warn('WebSocket is not open');
        }
    }

    async close(): Promise<void> {
        this.socket?.close();
        this.socket = undefined;
    }
}

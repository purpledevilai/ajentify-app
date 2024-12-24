export interface UIUpdate {
    type: string;
    [key: string]: unknown;
}

export interface ChatResponse {
    response: string;
    events?: UIUpdate[];
}
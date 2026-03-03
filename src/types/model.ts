export interface Model {
    model: string;
    model_provider: "openai" | "anthropic";
    input_token_cost: number;
    output_token_cost: number;
    context_window_size: number;
}

export function formatContextWindow(tokens: number): string {
    if (tokens >= 1000000) {
        return `${(tokens / 1000000).toFixed(tokens % 1000000 === 0 ? 0 : 1)}M`;
    }
    return `${(tokens / 1000).toFixed(0)}K`;
}

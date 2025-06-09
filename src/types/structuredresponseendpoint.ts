export interface StructuredResponseEndpoint {
    sre_id: string;
    org_id: string;
    name: string;
    description?: string;
    pd_id: string;
    /**
     * Prompt template used when generating the structured response.
     * Supports variables wrapped in curly braces e.g. {variable}.
     */
    prompt_template?: string;
    is_public: boolean;
    created_at: number;
    updated_at: number;
}

export interface StructuredResponseEndpoint {
    sre_id: string;
    org_id: string;
    name: string;
    description?: string;
    pd_id: string;
    /**
     * Prompt template containing the variable name strings that will be replaced at runtime.
     */
    prompt_template?: string;
    /**
     * Explicit variable names used in the prompt template. When set (new-style SRE), each name
     * is replaced in the prompt template via direct string replacement at run time.
     * When absent (legacy SRE), the old {variable} placeholder syntax is used instead.
     */
    variable_names?: string[] | null;
    model_id?: string | null;
    is_public: boolean;
    /** Stage that owns this SRE (when deploy-managed via AjDK). null for dashboard-created SREs. */
    stage_id?: string | null;
    /** Stable logical name within the stage (the manifest key). null for dashboard-created SREs. */
    logical_name?: string | null;
    created_at: number;
    updated_at: number;
}

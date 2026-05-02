export interface JsonDocument {
    document_id: string;
    name: string;
    data: Record<string, unknown>;
    /** Stage that owns this document (when deploy-managed via AjDK). null for dashboard-created documents. */
    stage_id?: string | null;
    /** Stable logical name within the stage (the manifest key). null for dashboard-created documents. */
    logical_name?: string | null;
    created_at?: number;
    updated_at?: number;
}

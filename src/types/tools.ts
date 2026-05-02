import { UIParameterNode } from "./parameterdefinition";

export interface Tool {
    tool_id: string;
    org_id: string;
    name: string;
    description?: string;
    pd_id?: string | null;
    code?: string;
    pass_context?: boolean;
    is_async?: boolean;
    is_client_side_tool?: boolean;
    /** Stage that owns this tool (when deploy-managed via AjDK). null for dashboard-created tools. */
    stage_id?: string | null;
    /** Stable logical name within the stage (the manifest key). null for dashboard-created tools. */
    logical_name?: string | null;
    created_at?: number;
    updated_at?: number;
}

export interface TestInput {
    name: string;
    type: "string" | "number" | "integer" | "boolean" | "object" | "array" | "enum";
    value: string | number | boolean | TestInput[];
    options?: string[];
    arrayTypeParameter?: UIParameterNode;
}

export type AnyType = string | number | boolean | { [key: string]: AnyType } | AnyType[];

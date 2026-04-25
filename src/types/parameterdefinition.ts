/**
 * JSON Schema (Draft 2020-12) — canonical wire/storage shape used by the API.
 * v1 deliberately surfaces only the universal subset supported by every
 * mainstream LLM provider (OpenAI, Anthropic, Gemini) and LangChain. Anything
 * outside this set is intentionally not modelled in the UI yet.
 */
export interface JsonSchema {
    /** Primitive type or union of types; `"integer"` is supported alongside `"number"`. */
    type?: JsonSchemaType | JsonSchemaType[];
    description?: string;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    items?: JsonSchema;
    enum?: Array<string | number | boolean | null>;
    additionalProperties?: boolean | JsonSchema;
    default?: string | number | boolean | null;
    anyOf?: JsonSchema[];
    $defs?: Record<string, JsonSchema>;
    $ref?: string;
    $schema?: string;
}

export type JsonSchemaType =
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "object"
    | "array"
    | "null";

/**
 * UI-internal recursive tree shape that powers the Tool Builder and SRE
 * Builder editors. `enum` survives here as a UI pseudo-type — it gets
 * collapsed into `{type:"string", enum:[...]}` at the API boundary via
 * `uiTreeToJsonSchema()`.
 */
export interface UIParameterNode {
    name: string;
    description: string;
    type: "string" | "number" | "integer" | "boolean" | "object" | "array" | "enum";
    parameters: UIParameterNode[];
    required: boolean;
    defaultValue?: string | number | boolean;
}

export interface ParameterDefinition {
    pd_id: string;
    org_id: string;
    schema: JsonSchema;
    created_at: number;
    updated_at: number;
}

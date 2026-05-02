/**
 * Wire shapes for `POST /deploy` and `POST /deploy/plan`.
 *
 * The request body is **stage-agnostic**: a `Manifest` (just `tools` / `sres` /
 * `agents`) is wrapped in a `DeployRequest` envelope that carries the target
 * `stage` (and optionally `org_id`) separately. That makes promotion trivial —
 * deploy the same manifest to a different stage to copy its resources forward.
 *
 * Mirrors the server-side Pydantic schema at
 * `AgentLambda/src/RequestHandlers/Deploy/ManifestSchema.py`. The canonical
 * JSON Schema for the *manifest body* is published at
 * https://api.ajentify.com/docs/manifest-schema.json — set `$schema` on a
 * manifest to get autocomplete in the Monaco editor.
 *
 * Object keys throughout are **logical names** — immutable reconciliation keys
 * within the stage (regex: `^[a-z][a-z0-9_]{0,62}$`). The user-facing display
 * name lives in nested `name` fields. Resource UUIDs never appear in the manifest.
 *
 * Tools author their input shape inline as `input_schema` (omit when there are
 * no args). SREs author their structured output inline as `output_schema`
 * (required). Parameter Definitions are *not* a manifest primitive — the server
 * synthesizes one private PD per Tool/SRE behind the scenes.
 */

import type { JsonSchema } from "./parameterdefinition";

export interface ManifestTool {
    name: string;
    description?: string | null;
    /** JSON Schema describing the tool's input arguments. Omit for tools that take no arguments. */
    input_schema?: JsonSchema | null;
    code?: string | null;
    pass_context?: boolean;
    is_async?: boolean;
    is_client_side_tool?: boolean;
}

export interface ManifestSRE {
    name: string;
    description?: string | null;
    /** JSON Schema describing the SRE's structured output. Required — every SRE has structured output. */
    output_schema: JsonSchema;
    is_public?: boolean;
    prompt_template: string;
    variable_names?: string[] | null;
    model_id?: string | null;
}

export interface ManifestAgent {
    name: string;
    description: string;
    prompt: string;
    is_public?: boolean;
    agent_speaks_first?: boolean;
    /** Logical names of tools in this manifest, or built-in tool IDs. */
    tools?: string[];
    uses_prompt_args?: boolean;
    prompt_arg_names?: string[];
    voice_id?: string | null;
    initialize_tool_id?: string | null;
    model_id?: string | null;
}

/**
 * Stage-agnostic resource declarations. The target stage is supplied separately
 * on the `DeployRequest` envelope so the same manifest can be promoted across
 * stages.
 */
export interface Manifest {
    /** Editor-only reference to the manifest JSON Schema. Stripped server-side. */
    $schema?: string;
    tools?: Record<string, ManifestTool>;
    sres?: Record<string, ManifestSRE>;
    agents?: Record<string, ManifestAgent>;
}

/** Top-level wire shape of `POST /deploy` and `POST /deploy/plan`. */
export interface DeployRequest {
    /**
     * Stable identifier for the stage to deploy into (e.g. 'frontend-staging',
     * 'backend-prod'). Created if it does not exist. Must match
     * `^[a-z][a-z0-9-]{0,62}$`.
     */
    stage: string;
    /**
     * Organization to deploy into. Defaults to the user's first org when omitted.
     * Must be one the authenticated user has access to.
     */
    org_id?: string;
    /** Stage-agnostic resource declarations. */
    manifest: Manifest;
}

/** Per-resource action computed by `/deploy` (or planned by `/deploy/plan`). */
export interface ResourceOp {
    kind: "parameter_definition" | "tool" | "sre" | "agent";
    op: "create" | "update" | "delete" | "noop";
    logical_name: string;
    resource_id: string | null;
    diff_summary: string | null;
}

export interface DeployResponse {
    stage_id: string;
    stage_name: string;
    stage_created: boolean;
    summary: { create: number; update: number; delete: number; noop: number };
    operations: ResourceOp[];
}

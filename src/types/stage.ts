/**
 * A `Stage` is a server-managed scope that owns deploy-managed resources
 * (Agents, Tools, SREs, ParameterDefinitions, Documents, Data Windows). It's the
 * top-level primitive AjDK reconciles against — `POST /deploy` either creates the
 * stage or syncs the contents of an existing one.
 *
 * Stage `name` is free-form within the org (e.g. "frontend-staging", "backend-prod")
 * and is used as the user-facing handle: runtime addressing of resources via
 * `(stage, logical_name)` looks up the stage by this name. Resource IDs and stage_id
 * are server-generated UUIDs and are not authored client-side.
 */
export interface Stage {
    stage_id: string;
    org_id: string;
    name: string;
    description?: string | null;
    created_at: number;
    updated_at: number;
}

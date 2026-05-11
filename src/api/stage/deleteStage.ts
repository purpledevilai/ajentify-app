import { request } from "@/api/client";

/**
 * How `DELETE /stage/{id}` should treat the resources owned by the stage.
 *
 * - `destroy`: delete the stage *and every resource in it* (agents, tools+PDs,
 *   SREs+PDs, JSON documents). Use when promoting failed and you want a clean
 *   teardown.
 * - `detach`: keep every resource but strip its stage binding (clear `stage_id`
 *   and `logical_name`), then delete the stage. The resources fall back to
 *   being dashboard-managed.
 *
 * The backend has no default — the field is required so the destructive
 * choice is always explicit.
 */
export type DeleteStageMode = 'destroy' | 'detach';

export async function deleteStage(stageId: string, mode: DeleteStageMode): Promise<void> {
  await request<void>({
    method: 'DELETE',
    path: `/stage/${encodeURIComponent(stageId)}`,
    body: { mode },
  });
}

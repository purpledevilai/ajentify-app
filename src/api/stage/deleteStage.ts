import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

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
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/stage/${encodeURIComponent(stageId)}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': await authStore.getAccessToken() || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mode }),
            },
        );
        await checkResponseAndGetJson(response);
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred deleting the stage';
        throw Error(errorMessage);
    }
}

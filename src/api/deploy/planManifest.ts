import { DeployRequest, DeployResponse, Manifest } from "@/types/manifest";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

/**
 * Dry-run companion to {@link deployManifest}: returns the same shape but does
 * not mutate any resources. Used by the "Deploy from JSON" modal to render a
 * diff before the user confirms.
 *
 * @param stage     Target stage name to plan against.
 * @param manifest  Stage-agnostic resource declarations.
 * @param opts.orgId  Optional org override; defaults to the user's first org server-side.
 */
export async function planManifest(
    stage: string,
    manifest: Manifest,
    opts?: { orgId?: string }
): Promise<DeployResponse> {
    try {
        const body: DeployRequest = { stage, manifest };
        if (opts?.orgId) body.org_id = opts.orgId;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/deploy/plan`, {
            method: 'POST',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });
        return await checkResponseAndGetJson(response) as unknown as DeployResponse;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred planning the manifest';
        throw Error(errorMessage);
    }
}

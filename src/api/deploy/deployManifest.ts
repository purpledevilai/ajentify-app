import { DeployRequest, DeployResponse, Manifest } from "@/types/manifest";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


/**
 * Reconcile a stage's resources to match the supplied manifest.
 *
 * The stage is passed *separately* from the manifest body — the manifest itself
 * is stage-agnostic so the same body can be promoted between stages by calling
 * this function again with a different `stage` argument.
 *
 * @param stage     Target stage name (e.g. 'frontend-staging'). Created if missing.
 * @param manifest  Stage-agnostic resource declarations.
 * @param opts.orgId  Optional org override; defaults to the user's first org server-side.
 */
export async function deployManifest(
    stage: string,
    manifest: Manifest,
    opts?: { orgId?: string }
): Promise<DeployResponse> {
    try {
        const body: DeployRequest = { stage, manifest };
        if (opts?.orgId) body.org_id = opts.orgId;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/deploy`, {
            method: 'POST',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });
        return await checkResponseAndGetJson(response) as unknown as DeployResponse;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred deploying the manifest';
        throw Error(errorMessage);
    }
}

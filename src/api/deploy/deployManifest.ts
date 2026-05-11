import { DeployRequest, DeployResponse, Manifest } from "@/types/manifest";
import { request } from "@/api/client";


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
  const body: DeployRequest = { stage, manifest };
  if (opts?.orgId) body.org_id = opts.orgId;
  return request<DeployResponse>({
    method: 'POST',
    path: '/deploy',
    body,
  });
}

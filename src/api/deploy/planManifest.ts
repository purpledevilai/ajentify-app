import { DeployRequest, DeployResponse, Manifest } from "@/types/manifest";
import { request } from "@/api/client";

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
  const body: DeployRequest = { stage, manifest };
  if (opts?.orgId) body.org_id = opts.orgId;
  return request<DeployResponse>({
    method: 'POST',
    path: '/deploy/plan',
    body,
  });
}

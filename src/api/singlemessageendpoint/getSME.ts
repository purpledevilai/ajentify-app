import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { SingleMessageEndpoint } from "@/types/singlemessageendpoint";

export async function getSME(smeId: string): Promise<SingleMessageEndpoint> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sme/${smeId}`, {
        method: 'GET',
    });
    return await checkResponseAndGetJson(response) as unknown as SingleMessageEndpoint;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting SME data';
    throw Error(errorMessage);
  }
}

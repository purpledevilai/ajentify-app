import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";

export async function getSRE(sreId: string): Promise<StructuredResponseEndpoint> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sre/${sreId}`, {
        method: 'GET',
    });
    return await checkResponseAndGetJson(response) as unknown as StructuredResponseEndpoint;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting SRE data';
    throw Error(errorMessage);
  }
}

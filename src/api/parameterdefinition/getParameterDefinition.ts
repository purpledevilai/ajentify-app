import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { ParameterDefinition } from "@/types/parameterdefinition";

export async function getParameterDefinition(pdId: string): Promise<ParameterDefinition> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/parameter-definition/${pdId}`, {
        method: 'GET'
    });
    return await checkResponseAndGetJson(response) as unknown as ParameterDefinition;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting parameter definition data';
    throw Error(errorMessage);
  }
}
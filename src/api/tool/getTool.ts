import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { Tool } from "@/types/tools";

export async function getTool(toolId: string): Promise<Tool> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tool/${toolId}`, {
        method: 'GET'
    });
    return await checkResponseAndGetJson(response) as unknown as Tool;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting tool data';
    throw Error(errorMessage);
  }
}
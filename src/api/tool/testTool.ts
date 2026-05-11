import { request } from "@/api/client";
import { AnyType } from "@/types/tools";


export interface TestToolPayload {
    function_name: string;
    params: Record<string, AnyType>;
    code: string;
}

export async function testTool(payload: TestToolPayload): Promise<string> {
  const { result } = await request<{ result: string }>({
    method: 'POST',
    path: '/test-tool',
    body: payload,
  });
  return result;
}

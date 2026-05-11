import { request } from "@/api/client";

export interface UsageParams {
    start_date: string;
    end_date: string;
    org_id?: string;
}

export interface DailyUsage {
    date: string;
    total_tokens: number;
}

export interface ModelCost {
    model: string;
    input_tokens: number;
    output_tokens: number;
    cost: string;
}

export interface UsageResponse {
    daily_usage: DailyUsage[];
    total_cost: string;
    model_costs: ModelCost[];
}

export async function getUsage(params: UsageParams): Promise<UsageResponse> {
  return request<UsageResponse>({
    method: 'GET',
    path: '/usage',
    query: {
      start_date: params.start_date,
      end_date: params.end_date,
      org_id: params.org_id,
    },
  });
}

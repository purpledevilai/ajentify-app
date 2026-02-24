import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export interface UsageParams {
    start_date: string;
    end_date: string;
    timezone?: string;
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
    try {
        const searchParams = new URLSearchParams({
            start_date: params.start_date,
            end_date: params.end_date,
        });
        if (params.timezone) searchParams.set('timezone', params.timezone);
        if (params.org_id) searchParams.set('org_id', params.org_id);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/usage?${searchParams.toString()}`,
            {
                headers: {
                    'Authorization': await authStore.getAccessToken() || '',
                    'Content-Type': 'application/json',
                },
            }
        );
        return await checkResponseAndGetJson(response) as unknown as UsageResponse;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred fetching usage data';
        throw Error(errorMessage);
    }
}

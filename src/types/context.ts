/* eslint-disable */
export type Message =
  | {
      sender: "ai" | "human" | "system";
      message: string;
    }
  | {
      type: "tool_call";
      tool_call_id: string;
      tool_name: string;
      tool_input: Record<string, any>;
    }
  | {
      type: "tool_response";
      tool_call_id: string;
      tool_output: string;
    };

export interface Context {
    context_id: string;
    agent_id: string;
    org_id?: string | null;
    user_id?: string;
    client_id?: string | null;
    messages: Message[];
    user_defined?: Record<string, any> | null;
    model_id?: string | null;
    context_percentage?: number | null;
    created_at?: number;
    updated_at?: number;
    expires_at?: number | null;
}

export type OrgContextOwnerKind = "api_key" | "public";

export interface OrgContextSummary {
    context_id: string;
    agent_id: string;
    org_id: string;
    user_id: string;
    client_id?: string | null;
    owner_kind: OrgContextOwnerKind;
    last_message_preview?: string | null;
    created_at: number;
    updated_at: number;
    expires_at?: number | null;
}

export interface GetOrgContextsResponse {
    contexts: OrgContextSummary[];
    next_cursor?: string | null;
}
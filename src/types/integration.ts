export interface Integration {
  integration_id: string;
  org_id: string;
  type: 'gmail' | string;
  integration_config: {
    email?: string;
    [key: string]: unknown;
  };
  created_at: number;
  updated_at: number;
}


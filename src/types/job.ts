export interface Job {
    job_id: string;
    owner_id: string;
    status: 'queued' | 'in_progress' | 'error' | 'completed';
    message: string;
    data: any;
    created_at: number;
    updated_at: number;
}
import api from './api';
import { JOB_STATUS } from '@/utils/constants';

export interface JobStatus {
  job_id: string;
  status: typeof JOB_STATUS[keyof typeof JOB_STATUS];
  progress?: number;
  result?: {
    download_url: string;
    filename: string;
    file_size: number;
    original_size?: number;
    compressed_size?: number;
    compression_ratio?: number;
    space_saved?: number;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get job status by ID
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await api.get<JobStatus>(`/api/status/${jobId}`);
  return response.data;
}

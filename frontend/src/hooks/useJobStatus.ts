import { useState, useEffect, useCallback } from 'react';
import { getJobStatus, type JobStatus } from '@/services/jobStatus';
import { JOB_STATUS } from '@/utils/constants';

interface UseJobStatusState {
  status: JobStatus | null;
  loading: boolean;
  error: string | null;
}

export function useJobStatus(jobId: string | null) {
  const [state, setState] = useState<UseJobStatusState>({
    status: null,
    loading: false,
    error: null,
  });

  const fetchStatus = useCallback(async () => {
    if (!jobId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const status = await getJobStatus(jobId);
      setState({ status, loading: false, error: null });
      return status;
    } catch (error: any) {
      setState({
        status: null,
        loading: false,
        error: error.message || 'Failed to fetch status',
      });
      return null;
    }
  }, [jobId]);

  const reset = useCallback(() => {
    setState({ status: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    fetchStatus,
    reset,
    isCompleted: state.status?.status === JOB_STATUS.COMPLETED,
    isFailed: state.status?.status === JOB_STATUS.FAILED,
    isProcessing:
      state.status?.status === JOB_STATUS.PENDING ||
      state.status?.status === JOB_STATUS.PROCESSING,
  };
}

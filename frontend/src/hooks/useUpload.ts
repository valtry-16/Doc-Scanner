import { useState, useCallback } from 'react';
import { validateFile } from '@/utils/validators';
import type { UploadResponse } from '@/services/upload';

interface UseUploadState {
  uploading: boolean;
  error: string | null;
  jobId: string | null;
}

type UploadFunction = (files: File[], ...args: any[]) => Promise<UploadResponse>;

export function useUpload(uploadFunction: UploadFunction) {
  const [state, setState] = useState<UseUploadState>({
    uploading: false,
    error: null,
    jobId: null,
  });

  const upload = useCallback(
    async (files: File[], ...args: any[]) => {
      // Validate files
      for (const file of files) {
        const validation = validateFile(file);
        if (!validation.valid) {
          setState({ uploading: false, error: validation.error || 'Invalid file', jobId: null });
          return null;
        }
      }

      setState({ uploading: true, error: null, jobId: null });

      try {
        const response = await uploadFunction(files, ...args);
        setState({ uploading: false, error: null, jobId: response.job_id });
        return response.job_id;
      } catch (error: any) {
        setState({
          uploading: false,
          error: error.message || 'Upload failed',
          jobId: null,
        });
        return null;
      }
    },
    [uploadFunction]
  );

  const reset = useCallback(() => {
    setState({ uploading: false, error: null, jobId: null });
  }, []);

  return {
    ...state,
    upload,
    reset,
  };
}

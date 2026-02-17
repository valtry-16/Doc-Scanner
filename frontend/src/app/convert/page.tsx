'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import FeatureSelector from '@/components/FeatureSelector';
import JobProgress from '@/components/JobProgress';
import DownloadButton from '@/components/DownloadButton';
import ErrorAlert from '@/components/ErrorAlert';
import { useUpload } from '@/hooks/useUpload';
import { useJobStatus } from '@/hooks/useJobStatus';
import { usePolling } from '@/hooks/usePolling';
import { uploadForConvert } from '@/services/upload';
import { JOB_STATUS } from '@/utils/constants';

export default function ConvertPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<any>({ targetFormat: 'jpg' });
  const { uploading, error: uploadError, reset: resetUpload } = useUpload(uploadForConvert);
  const [jobId, setJobId] = useState<string | null>(null);
  const {
    status,
    loading,
    error: statusError,
    fetchStatus,
    reset: resetStatus,
    isCompleted,
    isFailed,
    isProcessing,
  } = useJobStatus(jobId);

  usePolling({
    enabled: jobId !== null && !isCompleted && !isFailed,
    onPoll: fetchStatus,
    shouldStop: (result) => {
      return result?.status === JOB_STATUS.COMPLETED || result?.status === JOB_STATUS.FAILED;
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    // Manually call upload since we need to pass targetFormat
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    
    try {
      const response = await uploadForConvert(files, options.targetFormat);
      setJobId(response.job_id);
    } catch (err: any) {
      // Error handled by useUpload
    }
  };

  const handleReset = () => {
    setFiles([]);
    setJobId(null);
    resetUpload();
    resetStatus();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Convert Files</h1>
        <p className="text-lg text-gray-600">
          Transform images between different formats (JPG, PNG, WebP, PDF)
        </p>
      </div>

      <div className="space-y-6">
        {uploadError && <ErrorAlert message={uploadError} onClose={resetUpload} />}
        {statusError && <ErrorAlert message={statusError} onClose={resetStatus} />}

        {!jobId && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <FileUploader 
                files={files} 
                onFilesChange={setFiles} 
                multiple={true}
                acceptMessage="📷 Images only: JPG, PNG, WebP (Max 25 MB)"
              />
            </div>

            {files.length > 0 && (
              <FeatureSelector feature="convert" onOptionsChange={setOptions} />
            )}

            {files.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : `Convert to ${options.targetFormat.toUpperCase()}`}
              </button>
            )}
          </>
        )}

        {jobId && <JobProgress status={status} loading={loading} />}

        {isCompleted && status?.result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Conversion complete!
            </h3>
            <DownloadButton
              downloadUrl={status.result.download_url}
              filename={status.result.filename}
            />
            <button
              onClick={handleReset}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Convert More Files
            </button>
          </div>
        )}

        {isFailed && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

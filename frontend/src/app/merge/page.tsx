'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import JobProgress from '@/components/JobProgress';
import DownloadButton from '@/components/DownloadButton';
import ErrorAlert from '@/components/ErrorAlert';
import { useUpload } from '@/hooks/useUpload';
import { useJobStatus } from '@/hooks/useJobStatus';
import { usePolling } from '@/hooks/usePolling';
import { uploadForMerge } from '@/services/upload';
import { JOB_STATUS } from '@/utils/constants';

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const { uploading, error: uploadError, upload, reset: resetUpload } = useUpload(uploadForMerge);
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
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge');
      return;
    }

    const newJobId = await upload(files);
    if (newJobId) {
      setJobId(newJobId);
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Merge PDFs</h1>
        <p className="text-lg text-gray-600">
          Combine multiple PDF files into a single document
        </p>
      </div>

      <div className="space-y-6">
        {uploadError && <ErrorAlert message={uploadError} onClose={resetUpload} />}
        {statusError && <ErrorAlert message={statusError} onClose={resetStatus} />}

        {!jobId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <FileUploader files={files} onFilesChange={setFiles} multiple={true} />
            
            {files.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={uploading || files.length < 2}
                  className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : `Merge ${files.length} PDF${files.length > 1 ? 's' : ''}`}
                </button>
                {files.length < 2 && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    At least 2 PDF files are required
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {jobId && <JobProgress status={status} loading={loading} />}

        {isCompleted && status?.result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              PDFs merged successfully!
            </h3>
            <DownloadButton
              downloadUrl={status.result.download_url}
              filename={status.result.filename}
            />
            <button
              onClick={handleReset}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Merge More Files
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

      <div className="mt-12 bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-2">Tips for merging</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
          <li>Upload PDFs in the order you want them merged</li>
          <li>You can drag files to reorder them before uploading</li>
          <li>All PDFs will be combined into a single file</li>
        </ul>
      </div>
    </div>
  );
}

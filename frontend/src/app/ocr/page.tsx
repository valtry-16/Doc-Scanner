'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import JobProgress from '@/components/JobProgress';
import DownloadButton from '@/components/DownloadButton';
import ErrorAlert from '@/components/ErrorAlert';
import { useUpload } from '@/hooks/useUpload';
import { useJobStatus } from '@/hooks/useJobStatus';
import { usePolling } from '@/hooks/usePolling';
import { uploadForOCR } from '@/services/upload';
import { JOB_STATUS } from '@/utils/constants';

export default function OCRPage() {
  const [files, setFiles] = useState<File[]>([]);
  const { uploading, error: uploadError, upload, reset: resetUpload } = useUpload(uploadForOCR);
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">OCR - Extract Text</h1>
        <p className="text-lg text-gray-600">
          Extract text from images and scanned PDF documents
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
                  disabled={uploading}
                  className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : `Extract Text from ${files.length} File${files.length > 1 ? 's' : ''}`}
                </button>
              </div>
            )}
          </div>
        )}

        {jobId && <JobProgress status={status} loading={loading} />}

        {isCompleted && status?.result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Text extraction complete!
            </h3>
            <DownloadButton
              downloadUrl={status.result.download_url}
              filename={status.result.filename}
            />
            <button
              onClick={handleReset}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Process More Files
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

      <div className="mt-12 bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="font-semibold text-orange-900 mb-2">OCR Tips</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
          <li>Works best with clear, high-contrast images</li>
          <li>Supports multiple languages</li>
          <li>Text is extracted and saved as a TXT file</li>
          <li>Can process both images and scanned PDFs</li>
        </ul>
      </div>
    </div>
  );
}

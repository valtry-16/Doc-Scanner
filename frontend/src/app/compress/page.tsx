'use client';

import { useState, useEffect } from 'react';
import FileUploader from '@/components/FileUploader';
import FeatureSelector from '@/components/FeatureSelector';
import CompressionPreview from '@/components/CompressionPreview';
import JobProgress from '@/components/JobProgress';
import DownloadButton from '@/components/DownloadButton';
import ErrorAlert from '@/components/ErrorAlert';
import { useUpload } from '@/hooks/useUpload';
import { useJobStatus } from '@/hooks/useJobStatus';
import { usePolling } from '@/hooks/usePolling';
import { uploadForCompress } from '@/services/upload';
import { JOB_STATUS } from '@/utils/constants';

export default function CompressPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<any>({ quality: 85 });
  const { uploading, error: uploadError, reset: resetUpload } = useUpload(uploadForCompress);
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

  // Start polling when we have a job ID and it's processing
  usePolling({
    enabled: jobId !== null && !isCompleted && !isFailed,
    onPoll: fetchStatus,
    shouldStop: (result) => {
      return result?.status === JOB_STATUS.COMPLETED || result?.status === JOB_STATUS.FAILED;
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }

    // Manually call upload with quality parameter
    try {
      const response = await uploadForCompress(files, options.quality);
      setJobId(response.job_id);
    } catch (err: any) {
      // Error handled by hook
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Compress Files</h1>
        <p className="text-lg text-gray-600">
          Reduce file sizes for images and PDFs without losing quality
        </p>
      </div>

      <div className="space-y-6">
        {/* Error Messages */}
        {uploadError && <ErrorAlert message={uploadError} onClose={resetUpload} />}
        {statusError && <ErrorAlert message={statusError} onClose={resetStatus} />}

        {/* File Uploader */}
        {!jobId && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <FileUploader files={files} onFilesChange={setFiles} multiple={true} />
            </div>
            
            {files.length > 0 && (
              <FeatureSelector
                feature="compress"
                onOptionsChange={(nextOptions) =>
                  setOptions((prev: any) => ({ ...prev, ...nextOptions }))
                }
              />
            )}
            
            {files.length > 0 && files[0] && (
              <CompressionPreview file={files[0]} quality={options.quality || 85} />
            )}
            
            {files.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : `Compress ${files.length} File${files.length > 1 ? 's' : ''}`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Job Progress */}
        {jobId && <JobProgress status={status} loading={loading} />}

        {/* Download Button */}
        {isCompleted && status?.result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Your file is ready!
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
          </div>
        )}

        {/* Failed State */}
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

      {/* Info Box */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Upload your images or PDFs</li>
          <li>We'll process them with optimal compression settings</li>
          <li>Download your compressed files</li>
          <li>Files are automatically deleted after 30 minutes</li>
        </ol>
      </div>
    </div>
  );
}

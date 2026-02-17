'use client';

import { Loader2, CheckCircle, XCircle, Clock, TrendingDown } from 'lucide-react';
import type { JobStatus } from '@/services/jobStatus';
import { JOB_STATUS } from '@/utils/constants';

interface JobProgressProps {
  status: JobStatus | null;
  loading: boolean;
}

export default function JobProgress({ status, loading }: JobProgressProps) {
  if (loading && !status) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
          <span className="text-gray-700">Loading job status...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case JOB_STATUS.PENDING:
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case JOB_STATUS.PROCESSING:
        return <Loader2 className="h-6 w-6 animate-spin text-primary-500" />;
      case JOB_STATUS.COMPLETED:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case JOB_STATUS.FAILED:
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case JOB_STATUS.PENDING:
        return 'Job pending...';
      case JOB_STATUS.PROCESSING:
        return 'Processing your files...';
      case JOB_STATUS.COMPLETED:
        return 'Processing completed!';
      case JOB_STATUS.FAILED:
        return 'Processing failed';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case JOB_STATUS.PENDING:
        return 'border-yellow-200 bg-yellow-50';
      case JOB_STATUS.PROCESSING:
        return 'border-primary-200 bg-primary-50';
      case JOB_STATUS.COMPLETED:
        return 'border-green-200 bg-green-50';
      case JOB_STATUS.FAILED:
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center space-x-4">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{getStatusText()}</h3>
          {status.status === JOB_STATUS.PROCESSING && status.progress !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{status.progress}% complete</p>
            </div>
          )}
          {status.status === JOB_STATUS.COMPLETED && status.result?.compression_ratio !== undefined && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700">
                  {status.result.compression_ratio}% smaller
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Original:</span> {formatFileSize(status.result.original_size || 0)}
                </div>
                <div>
                  <span className="font-medium">Compressed:</span> {formatFileSize(status.result.compressed_size || 0)}
                </div>
              </div>
              <div className="mt-1 text-sm text-green-600 font-medium">
                Saved {formatFileSize(status.result.space_saved || 0)}
              </div>
            </div>
          )}
          {status.status === JOB_STATUS.FAILED && status.error && (
            <p className="text-sm text-red-600 mt-1">{status.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

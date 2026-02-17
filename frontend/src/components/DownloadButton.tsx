'use client';

import { Download } from 'lucide-react';
import { downloadFile } from '@/services/download';
import { useState, useEffect, useCallback } from 'react';

interface DownloadButtonProps {
  downloadUrl: string;
  filename: string;
  autoDownload?: boolean;
}

export default function DownloadButton({ downloadUrl, filename, autoDownload = true }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    setError(null);

    try {
      await downloadFile(downloadUrl, filename);
    } catch (err: any) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  }, [downloadUrl, filename]);

  // Auto-download on mount if enabled
  useEffect(() => {
    if (autoDownload && !autoDownloaded && downloadUrl) {
      setAutoDownloaded(true);
      handleDownload();
    }
  }, [autoDownload, autoDownloaded, downloadUrl, handleDownload]);

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="h-5 w-5 mr-2" />
        {downloading ? 'Downloading...' : 'Download Processed File'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

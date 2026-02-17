'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CompressionPreviewProps {
  file: File | null;
  quality: number;
}

export default function CompressionPreview({ file, quality }: CompressionPreviewProps) {
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [compressedPreview, setCompressedPreview] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!file) {
      setOriginalPreview('');
      setCompressedPreview('');
      return;
    }

    // Only process image files
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Set original preview
    const originalUrl = URL.createObjectURL(file);
    setOriginalPreview(originalUrl);
    setOriginalSize(file.size);

    // Generate compressed preview
    generateCompressedPreview(file, quality);

    return () => {
      URL.revokeObjectURL(originalUrl);
    };
  }, [file, quality]);

  const generateCompressedPreview = async (file: File, quality: number) => {
    setIsProcessing(true);

    try {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // Convert to blob with quality setting
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setCompressedPreview(url);
            setCompressedSize(blob.size);
          }
          setIsProcessing(false);
        },
        file.type,
        quality / 100
      );
    } catch (error) {
      console.error('Error generating preview:', error);
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const savingsPercent = originalSize > 0 
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100) 
    : 0;

  if (!file || !file.type.startsWith('image/')) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Original</span>
            <span className="text-xs text-gray-500">{formatFileSize(originalSize)}</span>
          </div>
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {originalPreview && (
              <img
                src={originalPreview}
                alt="Original"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Compressed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Compressed</span>
            <span className="text-xs text-gray-500">{formatFileSize(compressedSize)}</span>
          </div>
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {isProcessing ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : compressedPreview ? (
              <img
                src={compressedPreview}
                alt="Compressed"
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Savings Info */}
      {compressedSize > 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">
              Estimated Savings:
            </span>
            <span className="text-lg font-bold text-green-600">
              {savingsPercent}%
            </span>
          </div>
          <div className="mt-1 text-xs text-green-700">
            {formatFileSize(originalSize - compressedSize)} saved
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 italic">
        Note: This is a browser preview. Actual server compression may differ slightly.
      </div>
    </div>
  );
}

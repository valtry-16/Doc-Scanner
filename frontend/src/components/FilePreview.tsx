'use client';

import { isImageFile, isPdfFile } from '@/utils/validators';
import { FileIcon, Image as ImageIcon, FileText } from 'lucide-react';

interface FilePreviewProps {
  file: File;
}

export default function FilePreview({ file }: FilePreviewProps) {
  const isImage = isImageFile(file.name);
  const isPdf = isPdfFile(file.name);

  if (isImage) {
    const imageUrl = URL.createObjectURL(file);
    return (
      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={file.name}
          className="w-full h-full object-contain"
          onLoad={() => URL.revokeObjectURL(imageUrl)}
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-lg">
        <div className="text-center">
          <FileText className="mx-auto h-16 w-16 text-red-500 mb-2" />
          <p className="text-sm text-gray-600">PDF Document</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-lg">
      <div className="text-center">
        <FileIcon className="mx-auto h-16 w-16 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Document</p>
      </div>
    </div>
  );
}

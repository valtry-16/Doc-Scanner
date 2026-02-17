import api from './api';

export interface UploadResponse {
  job_id: string;
  message: string;
}

/**
 * Upload files for compression
 */
export async function uploadForCompress(files: File[], quality: number = 85): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('quality', quality.toString());

  const response = await api.post<UploadResponse>('/api/compress', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Upload files for conversion
 */
export async function uploadForConvert(
  files: File[],
  options: {
    targetFormat: string;
    resizeEnabled?: boolean;
    resizeWidth?: number | null;
    resizeHeight?: number | null;
    keepAspect?: boolean;
  }
): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('target_format', options.targetFormat);

  if (options.resizeEnabled) {
    if (options.resizeWidth) {
      formData.append('resize_width', options.resizeWidth.toString());
    }
    if (options.resizeHeight) {
      formData.append('resize_height', options.resizeHeight.toString());
    }
    formData.append('keep_aspect', String(options.keepAspect !== false));
  }

  const response = await api.post<UploadResponse>('/api/convert', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Upload files for merging
 */
export async function uploadForMerge(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post<UploadResponse>('/api/merge', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Upload files for OCR
 */
export async function uploadForOCR(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post<UploadResponse>('/api/ocr', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

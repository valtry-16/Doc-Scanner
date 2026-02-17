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
  targetFormat: string
): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('target_format', targetFormat);

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

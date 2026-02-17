// Supported file extensions
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
export const SUPPORTED_DOCUMENT_FORMATS = ['pdf', 'docx', 'txt', 'html'];
export const SUPPORTED_FORMATS = [...SUPPORTED_IMAGE_FORMATS, ...SUPPORTED_DOCUMENT_FORMATS];

// MIME types
export const MIME_TYPES = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'application/pdf': ['pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'text/plain': ['txt'],
  'text/html': ['html'],
};

// File size limits
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
export const MAX_FILE_SIZE_MB = 25;

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Job status
export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Polling interval
export const POLLING_INTERVAL = 2000; // 2 seconds

// File retention
export const FILE_RETENTION_MINUTES = 30;

// Features
export const FEATURES = {
  COMPRESS: 'compress',
  CONVERT: 'convert',
  MERGE: 'merge',
  SPLIT: 'split',
  OCR: 'ocr',
} as const;

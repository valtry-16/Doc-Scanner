import { SUPPORTED_FORMATS, MAX_FILE_SIZE, MIME_TYPES } from './constants';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file extension
 */
export function validateFileExtension(filename: string): ValidationResult {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return { valid: false, error: 'File has no extension' };
  }
  
  if (!SUPPORTED_FORMATS.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file format. Supported: ${SUPPORTED_FORMATS.join(', ')}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validates file size
 */
export function validateFileSize(size: number): ValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB limit`,
    };
  }
  
  return { valid: true };
}

/**
 * Validates file MIME type
 */
export function validateMimeType(file: File): ValidationResult {
  const allowedMimeTypes = Object.keys(MIME_TYPES);
  
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validates a file completely
 */
export function validateFile(file: File): ValidationResult {
  // Check file size
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  
  // Check MIME type
  const mimeValidation = validateMimeType(file);
  if (!mimeValidation.valid) {
    return mimeValidation;
  }
  
  // Check extension
  const extensionValidation = validateFileExtension(file.name);
  if (!extensionValidation.valid) {
    return extensionValidation;
  }
  
  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf';
}

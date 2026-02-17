import { API_BASE_URL } from '@/utils/constants';

/**
 * Download processed file
 */
export async function downloadFile(downloadUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}${downloadUrl}`);
    
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Failed to download file');
  }
}

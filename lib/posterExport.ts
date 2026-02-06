// DOM-based poster export using html2canvas
// Captures the actual MoonPoster component exactly as rendered by the browser
import html2canvas from 'html2canvas';

/**
 * Captures a DOM element (MoonPoster) as a high-resolution PNG blob.
 * Uses html2canvas to ensure pixel-perfect match with the browser preview.
 */
export async function generatePosterFromElement(
  element: HTMLElement,
  targetWidth: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  onProgress?.(10);

  // Calculate scale: element is rendered at ~500px wide, we need targetWidth
  const rect = element.getBoundingClientRect();
  const scale = targetWidth / rect.width;

  onProgress?.(30);

  // Capture the DOM element exactly as the browser renders it
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  });

  onProgress?.(90);

  // Convert canvas to PNG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

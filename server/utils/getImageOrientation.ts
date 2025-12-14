/**
 * Determines the orientation of an image based on its width and height.
 * @param width - The width of the image
 * @param height - The height of the image
 * @returns 'landscape' | 'portrait' | 'square' depending on the dimensions
 */
export function getImageOrientation(width: number, height: number): 'landscape' | 'portrait' | 'square' {
  if (width > height) {
    return 'landscape'
  } else if (height > width) {
    return 'portrait'
  } else {
    return 'square'
  }
}
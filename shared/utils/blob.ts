import type { BlobType } from '@nuxthub/core'
export const ACCEPTED_IMAGE_TYPES: BlobType[] = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
export const MIN_DIMENSIONS = { width: 200, height: 200 }
export const MAX_DIMENSIONS = { width: 4096, height: 4096 }

/**
 * Formats bytes as human readable text.
 * @param bytes - number of bytes
 * @param decimals - number of decimals to display
 * @returns formatted string
 */
export const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Get image path for given filename
 * @param filename 
 * @returns image path
 */
export const getImagePath = (filename: string) => {
    return `/images/${filename}`
}
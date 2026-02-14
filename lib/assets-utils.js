/**
 * Assets Management Utilities
 *
 * This module provides utility functions for enhanced assets management including:
 * - Smart filename conflict resolution
 * - Storage cleanup operations
 * - File formatting and validation
 * - Following the same pattern as avatar-utils.js but for assets bucket
 */

/**
 * Generate unique filename with conflict resolution
 * Uses numbering pattern: filename.ext -> filename_1.ext -> filename_2.ext
 *
 * @param {string} originalName - Original filename from uploaded file
 * @param {Object} supabaseClient - Supabase client instance
 * @returns {Promise<string>} - Unique filename
 */
export async function generateUniqueFileName(originalName, supabaseClient) {
  try {
    // Extract base name and extension
    const lastDotIndex = originalName.lastIndexOf('.')
    if (lastDotIndex === -1) {
      // No extension found
      return originalName
    }

    const baseName = originalName.substring(0, lastDotIndex)
    const extension = originalName.substring(lastDotIndex + 1)

    // Clean up base name (remove special characters, keep spaces and basic punctuation)
    const cleanBaseName = baseName.replace(/[<>:"/\\|?*]/g, '').trim()

    let finalName = originalName
    let counter = 1

    // List existing files in assets bucket (no folder structure)
    const { data: existingFiles, error: listError } = await supabaseClient.storage
      .from('assets')
      .list('')

    if (listError) {
      console.error('Error listing existing files:', listError)
      // Fall back to original name if we can't list files
      return originalName
    }

    const existingFileNames = existingFiles?.map(file => file.name) || []

    // Check for conflicts and append number if needed
    while (existingFileNames.includes(finalName)) {
      finalName = `${cleanBaseName}_${counter}.${extension}`
      counter++
    }

    return finalName

  } catch (error) {
    console.error('Error generating unique filename:', error)
    // Fall back to timestamp-based name if all else fails
    const timestamp = Date.now()
    const extension = originalName.split('.').pop()
    return `asset_${timestamp}.${extension}`
  }
}

/**
 * Clean up old asset file from storage
 *
 * @param {Object} supabaseClient - Supabase client instance
 * @param {string} storagePath - Path of file to delete
 * @returns {Promise<boolean>} - True if successful or no file to delete
 */
export async function cleanupOldAsset(supabaseClient, storagePath) {
  if (!storagePath) {
    console.log('No storage path provided, nothing to cleanup')
    return true
  }

  try {
    const { error: deleteError } = await supabaseClient.storage
      .from('assets')
      .remove([storagePath])

    if (deleteError) {
      console.error('Failed to delete old asset:', deleteError)
      // Don't fail the upload, just log the error
      return false
    }

    console.log('Successfully deleted old asset:', storagePath)
    return true

  } catch (error) {
    console.error('Error during asset cleanup:', error)
    return false
  }
}

/**
 * Get asset storage path from URL
 *
 * @param {string} assetUrl - Public URL from asset storage
 * @returns {string|null} - Storage path or null if invalid
 */
export function extractStoragePathFromUrl(assetUrl) {
  if (!assetUrl) return null

  try {
    const url = new URL(assetUrl)
    const pathParts = url.pathname.split('/')

    // Find the index of 'assets' in the path
    const assetsIndex = pathParts.findIndex(part => part === 'assets')

    if (assetsIndex === -1 || assetsIndex >= pathParts.length - 1) {
      console.error('Invalid asset URL format:', assetUrl)
      return null
    }

    // Extract file path (everything after 'assets')
    const filePath = pathParts.slice(assetsIndex + 1).join('/')
    return filePath

  } catch (error) {
    console.error('Error parsing asset URL:', error)
    return null
  }
}

// Export allowed types for use in API routes
export const ALLOWED_ASSET_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']

/**
 * Validate uploaded asset file
 *
 * @param {File} file - File object to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export function validateAssetFile(file) {
  // Check file type
  if (!ALLOWED_ASSET_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.type}. Only PNG, JPG, SVG, or WebP images are allowed.`
    }
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size is 5MB.'
    }
  }

  // Check minimum size (avoid empty files)
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty. Please select a valid image file.'
    }
  }

  return {
    isValid: true,
    error: null
  }
}

/**
 * Format file size for human-readable display
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human-readable file size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return 'Unknown size'

  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  if (i === 0) return `${bytes} ${sizes[i]}`

  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
}

/**
 * Truncate filename for display with tooltip support
 *
 * @param {string} filename - Original filename
 * @param {number} maxLength - Maximum length before truncation
 * @returns {Object} - Object with displayText and shouldShowTooltip
 */
export function truncateFilename(filename, maxLength = 30) {
  if (!filename) {
    return { displayText: '', shouldShowTooltip: false }
  }

  if (filename.length <= maxLength) {
    return { displayText: filename, shouldShowTooltip: false }
  }

  const truncated = filename.substring(0, maxLength - 3) + '...'
  return {
    displayText: truncated,
    shouldShowTooltip: true,
    fullText: filename
  }
}

/**
 * Generate safe filename for storage (remove dangerous characters)
 *
 * @param {string} filename - Original filename
 * @returns {string} - Safe filename
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'asset.jpg'

  // Remove dangerous characters, keep spaces, dots, hyphens, underscores
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove dangerous chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/\.+/g, '.') // Normalize dots
    .trim()
    .substring(0, 255) // Limit length
}

/**
 * Get file extension from filename
 *
 * @param {string} filename - Filename
 * @returns {string} - File extension (without dot)
 */
export function getFileExtension(filename) {
  if (!filename) return ''

  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex + 1).toLowerCase()
}
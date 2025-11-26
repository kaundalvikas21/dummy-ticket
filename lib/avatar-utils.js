/**
 * Avatar Management Utilities
 *
 * This module provides utility functions for enhanced avatar management including:
 * - Smart filename conflict resolution
 * - Storage cleanup operations
 * - File formatting and validation
 * - Legacy file migration helpers
 */

/**
 * Generate unique filename with conflict resolution
 * Uses numbering pattern: filename.ext -> filename_1.ext -> filename_2.ext
 *
 * @param {string} userId - User ID for storage folder path
 * @param {string} originalName - Original filename from uploaded file
 * @param {Object} supabaseClient - Supabase client instance
 * @returns {Promise<string>} - Unique filename
 */
export async function generateUniqueFileName(userId, originalName, supabaseClient) {
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

    // List existing files in user's avatar folder
    const { data: existingFiles, error: listError } = await supabaseClient.storage
      .from('avatars')
      .list(userId.toString())

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
    return `avatar_${timestamp}.${extension}`
  }
}

/**
 * Clean up old avatar file from storage
 *
 * @param {string} userId - User ID
 * @param {Object} supabaseClient - Supabase client instance
 * @param {string} storagePath - Path of file to delete
 * @returns {Promise<boolean>} - True if successful or no file to delete
 */
export async function cleanupOldAvatar(userId, supabaseClient, storagePath) {
  if (!storagePath) {
    console.log('No storage path provided, nothing to cleanup')
    return true
  }

  try {
    const { error: deleteError } = await supabaseClient.storage
      .from('avatars')
      .remove([storagePath])

    if (deleteError) {
      console.error('Failed to delete old avatar:', deleteError)
      // Don't fail the upload, just log the error
      return false
    }

    console.log('Successfully deleted old avatar:', storagePath)
    return true

  } catch (error) {
    console.error('Error during avatar cleanup:', error)
    return false
  }
}

/**
 * Get user's avatar storage path from URL
 *
 * @param {string} avatarUrl - Public URL from avatar_url field
 * @returns {string|null} - Storage path or null if invalid
 */
export function extractStoragePathFromUrl(avatarUrl) {
  if (!avatarUrl) return null

  try {
    const url = new URL(avatarUrl)
    const pathParts = url.pathname.split('/')

    // Find the index of 'avatars' in the path
    const avatarsIndex = pathParts.findIndex(part => part === 'avatars')

    if (avatarsIndex === -1 || avatarsIndex >= pathParts.length - 1) {
      console.error('Invalid avatar URL format:', avatarUrl)
      return null
    }

    // Extract file path (everything after 'avatars')
    const filePath = pathParts.slice(avatarsIndex + 1).join('/')
    return filePath

  } catch (error) {
    console.error('Error parsing avatar URL:', error)
    return null
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
 * Validate uploaded file
 *
 * @param {File} file - File object to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export function validateAvatarFile(file) {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
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
 * Check if filename follows legacy pattern (avatar_userId_timestamp.ext)
 *
 * @param {string} filename - Filename to check
 * @returns {boolean} - True if legacy pattern
 */
export function isLegacyFilename(filename) {
  if (!filename) return false

  // Pattern: avatar_someuuid_1234567890.ext
  const legacyPattern = /^avatar_[a-f0-9-]+_\d+\.[a-z]+$/i
  return legacyPattern.test(filename)
}

/**
 * Generate user-friendly name for legacy files
 *
 * @param {string} legacyFilename - Legacy filename
 * @returns {string} - User-friendly filename
 */
export function generateFriendlyNameForLegacy(legacyFilename) {
  if (!legacyFilename) return 'avatar.jpg'

  const extension = legacyFilename.split('.').pop() || 'jpg'
  return `legacy-avatar-${Date.now()}.${extension}`
}

/**
 * Create comprehensive file metadata for storage
 *
 * @param {Object} params - File metadata parameters
 * @returns {Object} - Complete metadata object
 */
export function createFileMetadata({
  userId,
  bucketName = 'avatars',
  originalFilename,
  storagePath,
  fileSize,
  mimeType,
  filePurpose = 'avatar'
}) {
  return {
    user_id: userId,
    bucket_name: bucketName,
    original_filename: originalFilename,
    storage_path: storagePath,
    file_size: fileSize,
    mime_type: mimeType,
    file_purpose: filePurpose,
    created_at: new Date().toISOString(),
    is_active: true
  }
}

/**
 * Truncate filename for display with tooltip support
 *
 * @param {string} filename - Original filename
 * @param {number} maxLength - Maximum length before truncation
 * @returns {Object} - Object with displayText and shouldShowTooltip
 */
export function truncateFilename(filename, maxLength = 20) {
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

/**
 * Check if file type supports transparency
 *
 * @param {string} mimeType - MIME type
 * @returns {boolean} - True if supports transparency
 */
export function supportsTransparency(mimeType) {
  const transparentFormats = ['image/png', 'image/gif', 'image/webp']
  return transparentFormats.includes(mimeType)
}

/**
 * Generate safe filename for storage (remove dangerous characters)
 *
 * @param {string} filename - Original filename
 * @returns {string} - Safe filename
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'avatar.jpg'

  // Remove dangerous characters, keep spaces, dots, hyphens, underscores
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove dangerous chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/\.+/g, '.') // Normalize dots
    .trim()
    .substring(0, 255) // Limit length
}
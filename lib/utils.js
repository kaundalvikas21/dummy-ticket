import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get user initials from first name, last name, or email
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} email - User's email (fallback)
 * @returns {string} - User initials (1-2 characters)
 */
export function getUserInitials(firstName, lastName, email) {
  // Try to get initials from first and last name
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // If only first name is available, use first two letters
  if (firstName && firstName.length >= 2) {
    return firstName.substring(0, 2).toUpperCase()
  }

  // If first name is single character, use it
  if (firstName) {
    return firstName.charAt(0).toUpperCase()
  }

  // If only last name is available, use first two letters
  if (lastName && lastName.length >= 2) {
    return lastName.substring(0, 2).toUpperCase()
  }

  // If last name is single character, use it
  if (lastName) {
    return lastName.charAt(0).toUpperCase()
  }

  // Email fallback removed - only use name-based initials

  // Default fallback
  return 'U'
}

/**
 * Get user display name with fallbacks
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} email - User's email (fallback)
 * @returns {string} - User display name
 */
export function getUserDisplayName(firstName, lastName, email) {
  const fName = (firstName || '').trim()
  const lName = (lastName || '').trim()

  if (fName && lName) {
    if (fName === lName || lName === 'Unknown') return fName
    return `${fName} ${lName}`
  }

  if (fName) return fName
  if (lName) return lName

  if (email) {
    return email.split('@')[0]
  }

  return 'User'
}

/**
 * Get avatar display URL with fallback
 * @param {string} avatarUrl - User's uploaded avatar URL
 * @param {string} fallbackUrl - Default fallback URL (will return null to use initials)
 * @returns {string|null} - Avatar URL to display, null if should use initials
 */
export function getAvatarDisplayUrl(avatarUrl, fallbackUrl = null) {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl
  }

  // Return null to trigger AvatarFallback (initials/skeleton) instead of placeholder image
  return null
}

/**
 * Compress image if file size > maxSizeMB
 * @param {File} file - Original file
 * @param {number} maxSizeMB - Max size in MB (default 2)
 * @param {number} initialQuality - Starting quality (0-1, default 0.9)
 * @returns {Promise<File>} - Compressed file or original if small enough
 */
export async function compressImage(file, maxSizeMB = 2, initialQuality = 0.9) {
  const maxSize = maxSizeMB * 1024 * 1024
  if (file.size <= maxSize) return file

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Scale down ONLY if massive to help performance, but keep large enough for quality
        const MAX_DIMENSION = 2560 // Increased to keep better resolution
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, width, height)

        const attemptCompression = (quality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Compression failed"))
                return
              }

              if (blob.size <= maxSize || quality <= 0.5) {
                // Stop at 0.5 quality to prevent potato quality images
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                // Try again with lower quality
                attemptCompression(quality - 0.1)
              }
            },
            "image/jpeg",
            quality
          )
        }

        attemptCompression(initialQuality)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

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

  // Fallback to email
  if (email) {
    const emailPrefix = email.split('@')[0]
    return emailPrefix.charAt(0).toUpperCase()
  }

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
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }

  if (firstName) {
    return firstName
  }

  if (lastName) {
    return lastName
  }

  if (email) {
    return email.split('@')[0]
  }

  return 'User'
}

/**
 * Get avatar display URL with fallback
 * @param {string} avatarUrl - User's uploaded avatar URL
 * @param {string} fallbackUrl - Default fallback URL
 * @returns {string} - Avatar URL to display
 */
export function getAvatarDisplayUrl(avatarUrl, fallbackUrl = '/placeholder.svg') {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl
  }

  return fallbackUrl
}

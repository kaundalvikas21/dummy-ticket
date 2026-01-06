import { NextResponse } from "next/server"
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError,
  createSuccessResponse
} from "@/lib/auth-helper"
import {
  generateUniqueFileName,
  validateAssetFile
} from "@/lib/assets-utils"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request) {
  try {
    // Check admin authentication using Supabase
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return createAuthError('No file provided', 400)
    }

    // Validate file using assets utilities
    const validation = validateAssetFile(file)
    if (!validation.isValid) {
      return createAuthError(validation.error, 400)
    }

    // Generate unique filename using original name
    const uniqueFileName = await generateUniqueFileName(file.name, supabaseAdmin)
    const filePath = uniqueFileName

    // Convert file to buffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase storage in the 'assets' bucket using admin client
    const { data, error } = await supabaseAdmin.storage
      .from('assets')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Supabase storage upload error:', error)
      return createAuthError(`Failed to upload file: ${error.message}`, 500)
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('assets')
      .getPublicUrl(filePath)

    return createSuccessResponse({
      success: true,
      url: publicUrl,
      path: filePath,
      fileName: uniqueFileName,           // Storage filename (unique)
      originalFileName: file.name,        // Original user filename
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Storage upload error:', error)
    return createAuthError('Internal server error', 500)
  }
}

export async function DELETE(request) {
  try {
    // Check admin authentication using Supabase
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return createAuthError('File path is required', 400)
    }

    // Delete file from Supabase storage using admin client
    const { error } = await supabaseAdmin.storage
      .from('assets')
      .remove([path])

    if (error) {
      console.error('Supabase storage delete error:', error)
      return createAuthError(`Failed to delete file: ${error.message}`, 500)
    }

    return createSuccessResponse({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Storage delete error:', error)
    return createAuthError('Internal server error', 500)
  }
}
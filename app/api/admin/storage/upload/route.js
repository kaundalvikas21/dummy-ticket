import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server"

// Create Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Authentication middleware - check if user is admin via cookies
async function checkAdminAuth(request) {
  try {
    // Get auth data from cookies
    const cookieHeader = request.headers.get('cookie')

    if (!cookieHeader) {
      console.log('No cookies found')
      return null
    }

    // Parse cookies
    const cookies = {}
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        try {
          cookies[name] = decodeURIComponent(value)
        } catch (e) {
          cookies[name] = value
        }
      }
    })

    // Check for auth_profile cookie
    const authProfileCookie = cookies['auth_profile']
    if (!authProfileCookie) {
      console.log('No auth_profile cookie found')
      return null
    }

    let profile
    try {
      profile = JSON.parse(authProfileCookie)
    } catch (error) {
      console.error('Failed to parse auth_profile cookie:', error)
      return null
    }

    // Check if user has admin role
    if (profile.role !== 'admin') {
      console.log('User is not admin:', profile.role)
      return null
    }

    return profile
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function POST(request) {
  try {
    // Check admin authentication
    const adminUser = await checkAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PNG, JPG, SVG, or WebP.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `footer-logo-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

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
      return NextResponse.json(
        { error: `Failed to upload file: ${error.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('assets')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      fileName: fileName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Storage upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    // Check admin authentication
    const adminUser = await checkAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Delete file from Supabase storage using admin client
    const { error } = await supabaseAdmin.storage
      .from('assets')
      .remove([path])

    if (error) {
      console.error('Supabase storage delete error:', error)
      return NextResponse.json(
        { error: `Failed to delete file: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Storage delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
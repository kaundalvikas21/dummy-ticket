import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError
} from "@/lib/auth-helper"
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { ticket_id, locale, title, content } = await request.json()

    if (!ticket_id || !locale || !title || !content) {
      return NextResponse.json(
        { error: 'Ticket ID, locale, title, and content are required' },
        { status: 400 }
      )
    }

    // First check if translation already exists
    const { data: existingTranslation, error: checkError } = await supabase
      .from('about_dummy_tickets_translations')
      .select('id')
      .eq('ticket_id', ticket_id)
      .eq('locale', locale)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing translation:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing translation' },
        { status: 500 }
      )
    }

    let result
    if (existingTranslation) {
      // Update existing translation
      const { data: translation, error } = await supabase
        .from('about_dummy_tickets_translations')
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTranslation.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating translation:', error)
        return NextResponse.json(
          { error: 'Failed to update translation' },
          { status: 500 }
        )
      }
      result = translation
    } else {
      // Create new translation
      const { data: translation, error } = await supabase
        .from('about_dummy_tickets_translations')
        .insert([
          {
            ticket_id,
            locale,
            title: title.trim(),
            content: content.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating translation:', error)
        return NextResponse.json(
          { error: 'Failed to save translation' },
          { status: 500 }
        )
      }
      result = translation
    }

    return NextResponse.json({ translation: result }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/about/dummy-tickets/translations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    // SECURITY: Require admin authentication
    const supabaseAuth = createSupabaseClientWithAuth(request)
    await requireAdmin(supabaseAuth)

    const { searchParams } = new URL(request.url)
    const ticket_id = searchParams.get('ticket_id')

    if (!ticket_id) {
      return createAuthError('Ticket ID is required', 400)
    }

    // Use admin client for database operations to properly handle RLS
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

    const { data: translations, error } = await supabaseAdmin
      .from('about_dummy_tickets_translations')
      .select('*')
      .eq('ticket_id', ticket_id)
      .order('locale', { ascending: true })

    if (error) {
      console.error('Error fetching translations:', error)
      return createAuthError('Failed to fetch translations', 500)
    }

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Error in GET /api/about/dummy-tickets/translations:', error)
    return createAuthError('Internal server error', 500)
  }
}
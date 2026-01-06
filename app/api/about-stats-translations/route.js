import { NextResponse } from 'next/server'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError,
  validateInput
} from "@/lib/auth-helper"
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    // SECURITY: Require admin authentication
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    const { stat_id, locale, label, value } = await request.json()

    if (!stat_id || !locale || !label) {
      return createAuthError('Stat ID, locale, and label are required', 400)
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

    // First check if translation already exists
    const { data: existingTranslation, error: checkError } = await supabaseAdmin
      .from('about_stats_translations')
      .select('id')
      .eq('stat_id', stat_id)
      .eq('locale', locale)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing translation:', checkError)
      return createAuthError('Failed to check existing translation', 500)
    }

    let result
    if (existingTranslation) {
      // Update existing translation
      const { data: translation, error } = await supabaseAdmin
        .from('about_stats_translations')
        .update({
          label: label.trim(),
          value: value?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTranslation.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating translation:', error)
        return createAuthError('Failed to update translation', 500)
      }
      result = translation
    } else {
      // Create new translation
      const { data: translation, error } = await supabaseAdmin
        .from('about_stats_translations')
        .insert([
          {
            stat_id,
            locale,
            label: label.trim(),
            value: value?.trim() || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating translation:', error)
        return createAuthError('Failed to save translation', 500)
      }
      result = translation
    }

    return NextResponse.json({ translation: result }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/about-stats-translations:', error)
    return createAuthError('Internal server error', 500)
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const stat_id = searchParams.get('stat_id')

    if (!stat_id) {
      return NextResponse.json(
        { error: 'Stat ID is required' },
        { status: 400 }
      )
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
      .from('about_stats_translations')
      .select('*')
      .eq('stat_id', stat_id)
      .order('locale', { ascending: true })

    if (error) {
      console.error('Error fetching translations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch translations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Error in GET /api/about-stats-translations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError
} from "@/lib/auth-helper"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale')

    if (locale) {
      // Get specific translation
      const { data: translation, error } = await supabase
        .from('faq_page_section_translations')
        .select('*')
        .eq('section_id', id)
        .eq('locale', locale)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - translation doesn't exist
          return NextResponse.json({ translation: null })
        }
        console.error('Error fetching section translation:', error)
        return NextResponse.json(
          { error: 'Failed to fetch section translation', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ translation })
    } else {
      // Get all translations for this section
      const { data: translations, error } = await supabase
        .from('faq_page_section_translations')
        .select('*')
        .eq('section_id', id)
        .order('locale')

      if (error) {
        console.error('Error fetching section translations:', error)
        return NextResponse.json(
          { error: 'Failed to fetch section translations', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ translations })
    }
  } catch (error) {
    console.error('Error in GET /api/faq-page/sections/[id]/translations:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    // Check admin authentication using Supabase
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    const { id } = await params
    const { locale, title } = await request.json()

    if (!locale || !title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Locale and title are required' },
        { status: 400 }
      )
    }

    // Check if translation already exists
    const { data: existingTranslation, error: checkError } = await supabase
      .from('faq_page_section_translations')
      .select('*')
      .eq('section_id', id)
      .eq('locale', locale)
      .single()

    let result
    if (checkError && checkError.code === 'PGRST116') {
      // Translation doesn't exist, create new one
      const { data: translation, error: createError } = await supabase
        .from('faq_page_section_translations')
        .insert([
          {
            section_id: id,
            locale,
            title: title.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('Error creating section translation:', createError)
        return NextResponse.json(
          { error: 'Failed to create section translation', details: createError.message },
          { status: 500 }
        )
      }
      result = { translation, action: 'created' }
    } else {
      // Translation exists, update it
      const { data: translation, error: updateError } = await supabase
        .from('faq_page_section_translations')
        .update({
          title: title.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('section_id', id)
        .eq('locale', locale)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating section translation:', updateError)
        return NextResponse.json(
          { error: 'Failed to update section translation', details: updateError.message },
          { status: 500 }
        )
      }
      result = { translation, action: 'updated' }
    }

    return NextResponse.json(result, {
      status: result.action === 'created' ? 201 : 200
    })
  } catch (error) {
    console.error('Error in POST /api/faq-page/sections/[id]/translations:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Authentication') || error.message.includes('Admin')) {
      return createAuthError(error.message, 401)
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check admin authentication using Supabase
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale')

    if (!locale) {
      return NextResponse.json(
        { error: 'Locale is required for deletion' },
        { status: 400 }
      )
    }

    const { data: deletedTranslation, error } = await supabase
      .from('faq_page_section_translations')
      .delete()
      .eq('section_id', id)
      .eq('locale', locale)
      .select()
      .single()

    if (error) {
      console.error('Error deleting section translation:', error)
      return NextResponse.json(
        { error: 'Failed to delete section translation', details: error.message },
        { status: 500 }
      )
    }

    if (!deletedTranslation) {
      return NextResponse.json(
        { error: 'Section translation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Section translation deleted successfully',
      deletedTranslation
    })
  } catch (error) {
    console.error('Error in DELETE /api/faq-page/sections/[id]/translations:', error)

    // Handle authentication errors specifically
    if (error.message.includes('Authentication') || error.message.includes('Admin')) {
      return createAuthError(error.message, 401)
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
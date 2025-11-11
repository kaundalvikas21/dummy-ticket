import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const { translations } = await request.json()

    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json(
        { error: 'Translations array is required' },
        { status: 400 }
      )
    }

    // Validate each translation
    for (const translation of translations) {
      if (!translation.locale || !translation.title || translation.title.trim() === '') {
        return NextResponse.json(
          { error: 'Each translation must have locale and title' },
          { status: 400 }
        )
      }
    }

    const results = []

    // Process each translation
    for (const translation of translations) {
      const { locale, title } = translation

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
        const { data: createdTranslation, error: createError } = await supabase
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
          results.push({
            locale,
            success: false,
            error: createError.message
          })
        } else {
          results.push({
            locale,
            success: true,
            action: 'created',
            translation: createdTranslation
          })
        }
      } else {
        // Translation exists, update it
        const { data: updatedTranslation, error: updateError } = await supabase
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
          results.push({
            locale,
            success: false,
            error: updateError.message
          })
        } else {
          results.push({
            locale,
            success: true,
            action: 'updated',
            translation: updatedTranslation
          })
        }
      }
    }

    // Count successes and failures
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      message: `Successfully saved ${successCount} translations${failureCount > 0 ? ` (${failureCount} failed)` : ''}`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount
      }
    })

  } catch (error) {
    console.error('Error in POST /api/faq-page/sections/[id]/translations/batch:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
import { supabase } from '@/lib/supabase'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError,
  validateInput
} from "@/lib/auth-helper"
import { createClient } from '@supabase/supabase-js'

export async function POST(request, { params }) {
  try {
    // SECURITY: Require admin authentication
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    const { id } = await params
    const body = await request.json()

    // Validate required fields
    const { translations } = body
    if (!translations || !Array.isArray(translations)) {
      return createAuthError('Missing required field: translations (must be an array)', 400)
    }

    // Validate each translation object
    for (const translation of translations) {
      if (!translation.locale || !translation.title || !translation.content) {
        return createAuthError('Each translation must have: locale, title, content', 400)
      }
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

    // Verify the dummy ticket exists
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('about_dummy_tickets')
      .select('id')
      .eq('id', id)
      .single()

    if (ticketError) {
      if (ticketError.code === 'PGRST116') {
        return createAuthError('Dummy ticket not found', 404)
      }
      throw ticketError
    }

    const results = {
      created: [],
      updated: [],
      errors: []
    }

    // Process each translation
    for (const translationData of translations) {
      try {
        const { locale, title, content } = translationData

        // Check if translation already exists
        const { data: existingTranslation, error: checkError } = await supabaseAdmin
          .from('about_dummy_tickets_translations')
          .select('id')
          .eq('ticket_id', id)
          .eq('locale', locale)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existingTranslation) {
          // Update existing translation
          const { data: updatedTranslation, error: updateError } = await supabaseAdmin
            .from('about_dummy_tickets_translations')
            .update({
              title,
              content,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingTranslation.id)
            .select()
            .single()

          if (updateError) {
            results.errors.push({
              locale,
              error: updateError.message
            })
          } else {
            results.updated.push(updatedTranslation)
          }
        } else {
          // Create new translation
          const { data: createdTranslation, error: createError } = await supabaseAdmin
            .from('about_dummy_tickets_translations')
            .insert({
              ticket_id: id,
              locale,
              title,
              content
            })
            .select()
            .single()

          if (createError) {
            results.errors.push({
              locale,
              error: createError.message
            })
          } else {
            results.created.push(createdTranslation)
          }
        }
      } catch (error) {
        results.errors.push({
          locale: translationData.locale,
          error: error.message
        })
      }
    }

    // Return success response with results
    return Response.json({
      message: 'Batch translation processing completed',
      summary: {
        total: translations.length,
        created: results.created.length,
        updated: results.updated.length,
        errors: results.errors.length
      },
      results
    })

  } catch (error) {
    console.error('Error in POST /api/about/dummy-tickets/[id]/translations/batch:', error)
    return createAuthError('Failed to process batch translations', 500)
  }
}

export async function PUT(request, { params }) {
  try {
    // SECURITY: Require admin authentication
    const supabase = await createSupabaseClientWithAuth()
    await requireAdmin(supabase)

    const { id } = await params
    const body = await request.json()

    // For PUT, we'll replace all translations for this dummy ticket
    const { translations } = body
    if (!translations || !Array.isArray(translations)) {
      return createAuthError('Missing required field: translations (must be an array)', 400)
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

    // Verify the dummy ticket exists
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('about_dummy_tickets')
      .select('id')
      .eq('id', id)
      .single()

    if (ticketError) {
      if (ticketError.code === 'PGRST116') {
        return createAuthError('Dummy ticket not found', 404)
      }
      throw ticketError
    }

    // Delete all existing translations for this dummy ticket
    const { error: deleteError } = await supabaseAdmin
      .from('about_dummy_tickets_translations')
      .delete()
      .eq('ticket_id', id)

    if (deleteError) {
      throw deleteError
    }

    // Insert all new translations
    const translationsToInsert = translations.map(t => ({
      ticket_id: id,
      locale: t.locale,
      title: t.title,
      content: t.content
    }))

    const { data: insertedTranslations, error: insertError } = await supabaseAdmin
      .from('about_dummy_tickets_translations')
      .insert(translationsToInsert)
      .select()

    if (insertError) {
      throw insertError
    }

    return Response.json({
      message: 'All translations replaced successfully',
      count: insertedTranslations.length,
      translations: insertedTranslations
    })

  } catch (error) {
    console.error('Error in PUT /api/about/dummy-tickets/[id]/translations/batch:', error)
    return createAuthError('Failed to replace translations', 500)
  }
}
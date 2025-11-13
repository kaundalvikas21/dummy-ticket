import { supabase } from '@/lib/supabase'

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate required fields
    const { translations } = body
    if (!translations || !Array.isArray(translations)) {
      return new Response(JSON.stringify({
        error: 'Missing required field: translations (must be an array)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate each translation object
    for (const translation of translations) {
      if (!translation.locale || !translation.title || !translation.content) {
        return new Response(JSON.stringify({
          error: 'Each translation must have: locale, title, content'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Verify the dummy ticket exists
    const { data: ticket, error: ticketError } = await supabase
      .from('about_dummy_tickets')
      .select('id')
      .eq('id', id)
      .single()

    if (ticketError) {
      if (ticketError.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Dummy ticket not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
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
        const { data: existingTranslation, error: checkError } = await supabase
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
          const { data: updatedTranslation, error: updateError } = await supabase
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
          const { data: createdTranslation, error: createError } = await supabase
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
    return new Response(JSON.stringify({
      error: 'Failed to process batch translations',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    // For PUT, we'll replace all translations for this dummy ticket
    const { translations } = body
    if (!translations || !Array.isArray(translations)) {
      return new Response(JSON.stringify({
        error: 'Missing required field: translations (must be an array)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verify the dummy ticket exists
    const { data: ticket, error: ticketError } = await supabase
      .from('about_dummy_tickets')
      .select('id')
      .eq('id', id)
      .single()

    if (ticketError) {
      if (ticketError.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Dummy ticket not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      throw ticketError
    }

    // Delete all existing translations for this dummy ticket
    const { error: deleteError } = await supabase
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

    const { data: insertedTranslations, error: insertError } = await supabase
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
    return new Response(JSON.stringify({
      error: 'Failed to replace translations',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale')
    
    let query = supabase
      .from('about_dummy_tickets_translations')
      .select('*')
      .eq('ticket_id', id)

    // Filter by locale if provided
    if (locale) {
      query = query.eq('locale', locale)
    }

    const { data: translations, error } = await query.order('locale')

    if (error) throw error

    return Response.json({ translations })
  } catch (error) {
    console.error('Error in GET /api/about/dummy-tickets/[id]/translations:', error)
    return new Response(JSON.stringify({
      error: 'Failed to fetch translations',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate required fields
    const { locale, title, content } = body
    if (!locale || !title || !content) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: locale, title, content'
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

    // Check if translation already exists for this locale
    const { data: existingTranslation, error: existingError } = await supabase
      .from('about_dummy_tickets_translations')
      .select('id')
      .eq('ticket_id', id)
      .eq('locale', locale)
      .single()

    if (existingTranslation) {
      return new Response(JSON.stringify({
        error: 'Translation already exists for this locale'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create new translation
    const { data: translation, error } = await supabase
      .from('about_dummy_tickets_translations')
      .insert({
        ticket_id: id,
        locale,
        title,
        content
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ translation }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/about/dummy-tickets/[id]/translations:', error)
    return new Response(JSON.stringify({
      error: 'Failed to create translation',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
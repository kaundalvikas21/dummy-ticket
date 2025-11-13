import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'

    // First try to get tickets with translations
    let { data: tickets, error } = await supabase
      .from('about_dummy_tickets')
      .select(`
        *,
        about_dummy_tickets_translations (
          title,
          content,
          locale
        )
      `)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })

    
    if (error) {
      console.error('Error fetching dummy tickets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch dummy tickets' },
        { status: 500 }
      )
    }

    // Transform the data to include fallbacks and process content
    const transformedTickets = tickets.map(ticket => {
      // Find translation for current locale, fallback to any translation, then to original
      const translation = ticket.about_dummy_tickets_translations?.find(t => t.locale === locale) ||
                         ticket.about_dummy_tickets_translations?.[0] ||
                         null

      let processedContent = translation?.content || ticket.content

      // Parse list content if content_type is list and content is valid JSON
      if (ticket.content_type === 'list' && processedContent) {
        try {
          const parsed = JSON.parse(processedContent)
          if (Array.isArray(parsed)) {
            // Keep as JSON string for frontend to parse, but ensure it's valid
            processedContent = JSON.stringify(parsed)
          }
        } catch (e) {
          // If JSON parsing fails, treat as simple content
          console.warn('Failed to parse list content for ticket:', ticket.id, e)
        }
      }

      return {
        id: ticket.id,
        title: translation?.title || ticket.title,
        content: processedContent,
        locale: translation?.locale || locale || 'en',
        fallback_title: ticket.title,
        fallback_content: ticket.content,
        content_type: ticket.content_type,
        status: ticket.status,
        sort_order: ticket.sort_order,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at
      }
    })

        return NextResponse.json({ tickets: transformedTickets })
  } catch (error) {
    console.error('Error in GET /api/about/dummy-tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { title, content, content_type = 'simple', status = 'active', sort_order = 1 } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const insertData = {
        title: title.trim(),
        content: content.trim(),
        content_type,
        status,
        sort_order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: ticket, error } = await supabase
        .from('about_dummy_tickets')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('Error creating dummy ticket:', error)
        console.error('Supabase error details:', JSON.stringify(error, null, 2))
        return NextResponse.json(
          { error: 'Failed to create dummy ticket', details: error.message },
          { status: 500 }
        )
      }

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/about/dummy-tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
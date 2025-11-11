import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale')

    if (locale) {
      // Get specific translation
      const { data: translation, error } = await supabase
        .from('faq_page_item_translations')
        .select('*')
        .eq('item_id', id)
        .eq('locale', locale)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - translation doesn't exist
          return NextResponse.json({ translation: null })
        }
        console.error('Error fetching item translation:', error)
        return NextResponse.json(
          { error: 'Failed to fetch item translation', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ translation })
    } else {
      // Get all translations for this item
      const { data: translations, error } = await supabase
        .from('faq_page_item_translations')
        .select('*')
        .eq('item_id', id)
        .order('locale')

      if (error) {
        console.error('Error fetching item translations:', error)
        return NextResponse.json(
          { error: 'Failed to fetch item translations', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ translations })
    }
  } catch (error) {
    console.error('Error in GET /api/faq-page/items/[id]/translations:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const { locale, question, answer } = await request.json()

    if (!locale || !question || !answer) {
      return NextResponse.json(
        { error: 'Locale, question, and answer are required' },
        { status: 400 }
      )
    }

    if (question.trim() === '' || answer.trim() === '') {
      return NextResponse.json(
        { error: 'Question and answer cannot be empty' },
        { status: 400 }
      )
    }

    // Check if translation already exists
    const { data: existingTranslation, error: checkError } = await supabase
      .from('faq_page_item_translations')
      .select('*')
      .eq('item_id', id)
      .eq('locale', locale)
      .single()

    let result
    if (checkError && checkError.code === 'PGRST116') {
      // Translation doesn't exist, create new one
      const { data: translation, error: createError } = await supabase
        .from('faq_page_item_translations')
        .insert([
          {
            item_id: id,
            locale,
            question: question.trim(),
            answer: answer.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('Error creating item translation:', createError)
        return NextResponse.json(
          { error: 'Failed to create item translation', details: createError.message },
          { status: 500 }
        )
      }
      result = { translation, action: 'created' }
    } else {
      // Translation exists, update it
      const { data: translation, error: updateError } = await supabase
        .from('faq_page_item_translations')
        .update({
          question: question.trim(),
          answer: answer.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('item_id', id)
        .eq('locale', locale)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating item translation:', updateError)
        return NextResponse.json(
          { error: 'Failed to update item translation', details: updateError.message },
          { status: 500 }
        )
      }
      result = { translation, action: 'updated' }
    }

    return NextResponse.json(result, {
      status: result.action === 'created' ? 201 : 200
    })
  } catch (error) {
    console.error('Error in POST /api/faq-page/items/[id]/translations:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
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
      .from('faq_page_item_translations')
      .delete()
      .eq('item_id', id)
      .eq('locale', locale)
      .select()
      .single()

    if (error) {
      console.error('Error deleting item translation:', error)
      return NextResponse.json(
        { error: 'Failed to delete item translation', details: error.message },
        { status: 500 }
      )
    }

    if (!deletedTranslation) {
      return NextResponse.json(
        { error: 'Item translation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Item translation deleted successfully',
      deletedTranslation
    })
  } catch (error) {
    console.error('Error in DELETE /api/faq-page/items/[id]/translations:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
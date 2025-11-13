import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { stat_id, locale, label, value } = await request.json()

    if (!stat_id || !locale || !label) {
      return NextResponse.json(
        { error: 'Stat ID, locale, and label are required' },
        { status: 400 }
      )
    }

    // First check if translation already exists
    const { data: existingTranslation, error: checkError } = await supabase
      .from('about_stats_translations')
      .select('id')
      .eq('stat_id', stat_id)
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
        return NextResponse.json(
          { error: 'Failed to update translation' },
          { status: 500 }
        )
      }
      result = translation
    } else {
      // Create new translation
      const { data: translation, error } = await supabase
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
        return NextResponse.json(
          { error: 'Failed to save translation' },
          { status: 500 }
        )
      }
      result = translation
    }

    return NextResponse.json({ translation: result }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/about-stats-translations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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

    const { data: translations, error } = await supabase
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
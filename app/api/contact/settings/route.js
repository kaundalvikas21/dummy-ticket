import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import {
  requireAdmin,
  createSupabaseClientWithAuth,
  createAuthError
} from "@/lib/auth-helper"
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const keys = searchParams.get('keys')

    let query = supabase
      .from('contact_settings')
      .select('*')
      .order('settings_key')

    // If specific keys are requested, filter by them
    if (keys) {
      const keyList = keys.split(',')
      query = query.in('settings_key', keyList)
    }

    const { data: settings, error } = await query

    if (error) {
      console.error('Error fetching contact settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contact settings' },
        { status: 500 }
      )
    }

    // Transform the flat settings into a structured object
    const structuredSettings = {}
    settings?.forEach(setting => {
      structuredSettings[setting.settings_key] = {
        value: setting.settings_value,
        type: setting.settings_type,
        description: setting.description,
        updated_at: setting.updated_at
      }
    })

    return NextResponse.json({ settings: structuredSettings })
  } catch (error) {
    console.error('Error in GET /api/contact/settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // SECURITY: Require admin authentication for write operations
    const supabaseAuth = await createSupabaseClientWithAuth()
    await requireAdmin(supabaseAuth)

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

    const { settings_key, settings_value, settings_type = 'text', description } = await request.json()

    if (!settings_key || settings_value === undefined || settings_value.trim() === '') {
      return createAuthError('Settings key and value are required', 400)
    }

    // Check if setting already exists
    const { data: existingSetting, error: checkError } = await supabaseAdmin
      .from('contact_settings')
      .select('*')
      .eq('settings_key', settings_key)
      .single()

    let result
    if (checkError && checkError.code === 'PGRST116') {
      // Setting doesn't exist, create new one
      const { data: setting, error: createError } = await supabaseAdmin
        .from('contact_settings')
        .insert([
          {
            settings_key,
            settings_value: settings_value.trim(),
            settings_type,
            description: description || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('Error creating contact setting:', createError)
        return createAuthError('Failed to create contact setting: ' + createError.message, 500)
      }
      result = { setting, action: 'created' }
    } else {
      // Setting exists, update it
      const { data: updatedSetting, error: updateError } = await supabaseAdmin
        .from('contact_settings')
        .update({
          settings_value: settings_value.trim(),
          settings_type,
          description: description || existingSetting.description,
          updated_at: new Date().toISOString()
        })
        .eq('settings_key', settings_key)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating contact setting:', updateError)
        return createAuthError('Failed to update contact setting: ' + updateError.message, 500)
      }
      result = { setting: updatedSetting, action: 'updated' }
    }

    return NextResponse.json(result, {
      status: result.action === 'created' ? 201 : 200
    })
  } catch (error) {
    console.error('Error in POST /api/contact/settings:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    // SECURITY: Require admin authentication for write operations
    const supabaseAuth = await createSupabaseClientWithAuth()
    await requireAdmin(supabaseAuth)

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

    const { settings_key, settings_value, settings_type = 'text', description } = await request.json()

    if (!settings_key || settings_value === undefined || settings_value.trim() === '') {
      return createAuthError('Settings key and value are required', 400)
    }

    const { data: updatedSetting, error } = await supabaseAdmin
      .from('contact_settings')
      .update({
        settings_value: settings_value.trim(),
        settings_type,
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq('settings_key', settings_key)
      .select()
      .single()

    if (error) {
      console.error('Error updating contact setting:', error)
      return createAuthError('Failed to update contact setting: ' + error.message, 500)
    }

    return NextResponse.json({
      setting: updatedSetting,
      action: 'updated'
    })
  } catch (error) {
    console.error('Error in PUT /api/contact/settings:', error)
    return createAuthError('Internal server error: ' + error.message, 500)
  }
}

export async function DELETE(request) {
  try {
    // SECURITY: Require admin authentication for write operations
    const supabaseAuth = await createSupabaseClientWithAuth()
    await requireAdmin(supabaseAuth)

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

    const { searchParams } = new URL(request.url)
    const settings_key = searchParams.get('key')

    if (!settings_key) {
      return createAuthError('Settings key is required for deletion', 400)
    }

    const { data: deletedSetting, error } = await supabaseAdmin
      .from('contact_settings')
      .delete()
      .eq('settings_key', settings_key)
      .select()
      .single()

    if (error) {
      console.error('Error deleting contact setting:', error)
      return createAuthError('Failed to delete contact setting: ' + error.message, 500)
    }

    if (!deletedSetting) {
      return createAuthError('Contact setting not found', 404)
    }

    return NextResponse.json({
      message: 'Contact setting deleted successfully',
      deletedSetting
    })
  } catch (error) {
    console.error('Error in DELETE /api/contact/settings:', error)
    return createAuthError('Internal server error: ' + error.message, 500)
  }
}
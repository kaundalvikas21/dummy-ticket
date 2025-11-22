#!/usr/bin/env node

import { supabaseAdmin } from '../lib/supabase.js'

// Use process.env directly (loaded by Next.js automatically)

async function testSupabaseAuth() {
  console.log('🧪 Testing Supabase Auth creation...')

  try {
    // Test creating a user with admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'test-auth@example.com',
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User'
      },
      app_metadata: {
        role: 'user'
      }
    })

    if (error) {
      console.error('❌ Auth creation failed:', error.message)
      console.error('Full error:', error)
      return false
    }

    console.log('✅ User created successfully:', data.user.email)
    console.log('   User ID:', data.user.id)
    console.log('   Role:', data.user.app_metadata?.role)

    // Test creating profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        auth_user_id: data.user.id,
        first_name: 'Test',
        last_name: 'User',
        email: data.user.email,
        preferred_language: 'en'
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message)
      return false
    }

    console.log('✅ Profile created successfully:', profile.first_name, profile.last_name)

    // Clean up - delete test user
    await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    console.log('🧹 Test user deleted')

    return true

  } catch (error) {
    console.error('🚨 Test failed:', error.message)
    return false
  }
}

// Run the test
testSupabaseAuth()
  .then(success => {
    if (success) {
      console.log('\n🎉 Supabase Auth is working correctly!')
      console.log('   The issue is likely with the client-side signup process.')
    } else {
      console.log('\n💥 Supabase Auth has configuration issues.')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Unexpected error:', error)
    process.exit(1)
  })
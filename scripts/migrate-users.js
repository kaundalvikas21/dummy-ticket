#!/usr/bin/env node

import { supabaseAdmin } from '../lib/supabase.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function migrateUsers() {
  console.log('🚀 Starting user migration to Supabase Auth...')

  try {
    // 1. Export current users from custom system
    console.log('📤 Exporting users from custom auth system...')
    const { data: users, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, password, role, status, created_at, updated_at')
      .eq('status', 'active')
      .order('created_at', { ascending: true })

    if (fetchError) {
      throw new Error(`Failed to fetch users: ${fetchError.message}`)
    }

    console.log(`✅ Found ${users.length} active users to migrate`)

    // 2. Import users to Supabase Auth
    let successCount = 0
    let errorCount = 0

    for (const [index, user] of users.entries()) {
      try {
        console.log(`\n👤 Migrating user ${index + 1}/${users.length}: ${user.email}`)

        // Check if user already migrated
        const { data: existingMigration } = await supabaseAdmin
          .from('user_migrations')
          .select('id, migration_status')
          .eq('email', user.email)
          .single()

        if (existingMigration && existingMigration.migration_status === 'completed') {
          console.log(`⏭️  User ${user.email} already migrated, skipping...`)
          successCount++
          continue
        }

        // Create user in Supabase Auth with existing bcrypt password
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password, // bcrypt is compatible with Supabase Auth
          email_confirm: true, // Skip email verification since users are already active
          user_metadata: {
            migrated: true,
            original_user_id: user.id,
            migration_date: new Date().toISOString()
          },
          app_metadata: {
            role: user.role,
            old_user_id: user.id,
            migrated_at: new Date().toISOString()
          }
        })

        if (authError) {
          throw new Error(`Auth creation failed: ${authError.message}`)
        }

        // Track the migration
        const { error: trackingError } = await supabaseAdmin
          .from('user_migrations')
          .upsert({
            old_id: user.id,
            new_auth_id: authUser.user.id,
            email: user.email,
            role: user.role,
            migration_status: 'completed',
            migrated_at: new Date().toISOString()
          })
          .eq('email', user.email)

        if (trackingError) {
          console.warn(`⚠️  Migration tracking failed for ${user.email}: ${trackingError.message}`)
        }

        console.log(`✅ Successfully migrated: ${user.email} -> ${authUser.user.id}`)
        successCount++

      } catch (error) {
        console.error(`❌ Failed to migrate ${user.email}: ${error.message}`)

        // Track failed migration
        await supabaseAdmin
          .from('user_migrations')
          .upsert({
            old_id: user.id,
            email: user.email,
            role: user.role,
            migration_status: 'failed',
            error_message: error.message,
            retry_count: 1
          })
          .eq('email', user.email)

        errorCount++
      }
    }

    console.log(`\n🎉 Migration Summary:`)
    console.log(`✅ Successful migrations: ${successCount}`)
    console.log(`❌ Failed migrations: ${errorCount}`)
    console.log(`📊 Total users processed: ${users.length}`)

    if (errorCount > 0) {
      console.log(`\n⚠️  Some users failed to migrate. Check the user_migrations table for details.`)

      // Show failed users
      const { data: failedUsers } = await supabaseAdmin
        .from('user_migrations')
        .select('email, error_message, retry_count')
        .eq('migration_status', 'failed')

      if (failedUsers.length > 0) {
        console.log('\n❌ Failed migrations:')
        failedUsers.forEach(user => {
          console.log(`  - ${user.email}: ${user.error_message}`)
        })
      }
    }

    return successCount === users.length

  } catch (error) {
    console.error('🚨 Migration failed:', error.message)
    return false
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...')

  try {
    // Check migrated users count
    const { data: migrations } = await supabaseAdmin
      .from('user_migrations')
      .select('migration_status')

    const completed = migrations.filter(m => m.migration_status === 'completed').length
    const failed = migrations.filter(m => m.migration_status === 'failed').length
    const pending = migrations.filter(m => m.migration_status === 'pending').length

    console.log(`✅ Completed: ${completed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏳ Pending: ${pending}`)

    // Check Supabase Auth users
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    console.log(`👥 Total Supabase Auth users: ${authUsers.users.length}`)

    return completed > 0 && failed === 0

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return false
  }
}

// Main execution
async function main() {
  console.log('🔐 Supabase Auth Migration Tool')
  console.log('=================================\n')

  const success = await migrateUsers()

  if (success) {
    await verifyMigration()
    console.log('\n🎊 Migration completed successfully!')
    process.exit(0)
  } else {
    console.log('\n💥 Migration completed with errors. Please review the logs above.')
    process.exit(1)
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { migrateUsers, verifyMigration }
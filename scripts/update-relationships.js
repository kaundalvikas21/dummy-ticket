#!/usr/bin/env node

import { supabaseAdmin } from '../lib/supabase.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function updateRelationships() {
  console.log('🔄 Updating database relationships to use Supabase Auth IDs...')

  try {
    // Get all completed migrations
    console.log('📋 Fetching migration data...')
    const { data: migrations, error: migrationError } = await supabaseAdmin
      .from('user_migrations')
      .select('*')
      .eq('migration_status', 'completed')

    if (migrationError) {
      throw new Error(`Failed to fetch migration data: ${migrationError.message}`)
    }

    console.log(`✅ Found ${migrations.length} completed migrations`)

    if (migrations.length === 0) {
      console.log('⚠️  No completed migrations found. Please run migrate-users.js first.')
      return false
    }

    // Update user_profiles table
    console.log('\n👤 Updating user_profiles table...')
    let profileUpdateCount = 0

    for (const migration of migrations) {
      try {
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            auth_user_id: migration.new_auth_id,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', migration.old_id)

        if (updateError) {
          console.warn(`⚠️  Failed to update profile for ${migration.email}: ${updateError.message}`)
        } else {
          profileUpdateCount++
        }
      } catch (error) {
        console.warn(`⚠️  Error updating profile for ${migration.email}: ${error.message}`)
      }
    }

    console.log(`✅ Updated ${profileUpdateCount} user profiles`)

    // Update contact_submissions if it has user_id column
    console.log('\n📝 Updating contact_submissions table...')
    let contactUpdateCount = 0

    try {
      // Check if contact_submissions table exists and has user_id column
      const { data: columns } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'contact_submissions')
        .eq('column_name', 'user_id')

      if (columns && columns.length > 0) {
        for (const migration of migrations) {
          try {
            const { error: updateError } = await supabaseAdmin
              .from('contact_submissions')
              .update({ auth_user_id: migration.new_auth_id })
              .eq('user_id', migration.old_id)

            if (updateError) {
              console.warn(`⚠️  Failed to update contact submissions for ${migration.email}: ${updateError.message}`)
            } else {
              contactUpdateCount++
            }
          } catch (error) {
            console.warn(`⚠️  Error updating contact submissions for ${migration.email}: ${error.message}`)
          }
        }
        console.log(`✅ Updated ${contactUpdateCount} contact submissions`)
      } else {
        console.log('ℹ️  contact_submissions table does not exist or does not have user_id column, skipping...')
      }
    } catch (error) {
      console.log('ℹ️  Could not check contact_submissions table, skipping...')
    }

    // Update any other tables with user_id references
    console.log('\n🔍 Searching for other tables with user_id references...')

    // Common tables that might have user references
    const tablesToCheck = [
      'orders',
      'bookings',
      'documents',
      'support_tickets',
      'payments',
      'analytics_events'
    ]

    for (const tableName of tablesToCheck) {
      try {
        // Check if table exists and has user_id column
        const { data: columns } = await supabaseAdmin
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', tableName)
          .eq('column_name', 'user_id')

        if (columns && columns.length > 0) {
          console.log(`📋 Found ${tableName} table with user_id column`)

          // Check if it already has auth_user_id column
          const { data: authColumns } = await supabaseAdmin
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', tableName)
            .eq('column_name', 'auth_user_id')

          if (!authColumns || authColumns.length === 0) {
            // Add auth_user_id column
            const { error: addColumnError } = await supabaseAdmin.rpc('exec', {
              sql: `ALTER TABLE ${tableName} ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;`
            })

            if (addColumnError) {
              console.warn(`⚠️  Could not add auth_user_id to ${tableName}: ${addColumnError.message}`)
              continue
            }
          }

          // Update the relationships
          let updateCount = 0
          for (const migration of migrations) {
            try {
              const { error: updateError } = await supabaseAdmin
                .from(tableName)
                .update({ auth_user_id: migration.new_auth_id })
                .eq('user_id', migration.old_id)

              if (updateError) {
                console.warn(`⚠️  Failed to update ${tableName} for ${migration.email}: ${updateError.message}`)
              } else {
                updateCount++
              }
            } catch (error) {
              console.warn(`⚠️  Error updating ${tableName} for ${migration.email}: ${error.message}`)
            }
          }

          if (updateCount > 0) {
            console.log(`✅ Updated ${updateCount} records in ${tableName}`)
          }
        }
      } catch (error) {
        console.log(`ℹ️  Could not process ${tableName} table: ${error.message}`)
      }
    }

    console.log('\n🎉 Database relationships update completed!')
    console.log(`📊 Summary:`)
    console.log(`  - User profiles updated: ${profileUpdateCount}`)
    console.log(`  - Contact submissions updated: ${contactUpdateCount}`)

    return true

  } catch (error) {
    console.error('🚨 Relationship update failed:', error.message)
    return false
  }
}

async function verifyRelationships() {
  console.log('\n🔍 Verifying relationship updates...')

  try {
    // Check profiles with auth_user_id
    const { data: profiles } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, auth_user_id')
      .not('auth_user_id', 'is', null)

    console.log(`✅ Profiles with auth_user_id: ${profiles.length}`)

    // Check orphaned profiles (user_id but no auth_user_id)
    const { data: orphanedProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .is('auth_user_id', null)
      .not('user_id', 'is', null)

    if (orphanedProfiles.length > 0) {
      console.warn(`⚠️  Orphaned profiles (no auth_user_id): ${orphanedProfiles.length}`)
    } else {
      console.log('✅ No orphaned profiles found')
    }

    // Check migration completion
    const { data: migrations } = await supabaseAdmin
      .from('user_migrations')
      .select('migration_status')

    const completed = migrations.filter(m => m.migration_status === 'completed').length
    console.log(`✅ Completed migrations: ${completed}`)

    return profiles.length > 0 && orphanedProfiles.length === 0

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return false
  }
}

// Main execution
async function main() {
  console.log('🔗 Database Relationship Update Tool')
  console.log('===================================\n')

  const success = await updateRelationships()

  if (success) {
    await verifyRelationships()
    console.log('\n🎊 Relationship updates completed successfully!')
    process.exit(0)
  } else {
    console.log('\n💥 Relationship updates completed with errors. Please review the logs above.')
    process.exit(1)
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { updateRelationships, verifyRelationships }
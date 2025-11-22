// Check Database State
import { createClient } from '@supabase/supabase-js';

// Read environment variables
const fs = await import('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');

const supabaseUrl = envLines.find(line => line.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1];
const supabaseServiceKey = envLines.find(line => line.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseState() {
  console.log('🔍 CHECKING DATABASE STATE');

  try {
    // Check all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`📊 Found ${profiles.length} profiles in database:`);

    if (profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`👤 Profile ${index + 1}:`, {
          id: profile.id,
          auth_user_id: profile.auth_user_id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email || 'N/A',
          role: profile.role || 'N/A',
          created_at: profile.created_at
        });
      });
    }

    // Check triggers
    console.log('\n🔍 CHECKING TRIGGERS...');

    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name', 'event_manipulation', 'event_object_table')
      .eq('event_object_table', 'users')
      .eq('trigger_schema', 'auth');

    if (triggersError) {
      console.log('❌ Error checking triggers:', triggersError);
    } else {
      console.log(`🔧 Found ${triggers.length} auth.users triggers:`);
      triggers.forEach((trigger, index) => {
        console.log(`🎯 Trigger ${index + 1}:`, `${trigger.trigger_name} (${trigger.event_manipulation} on ${trigger.event_object_table})`);
      });
    }

    // Check functions
    console.log('\n🔍 CHECKING FUNCTIONS...');

    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname')
      .like('proname', '%create_user_profile%')
      .eq('pronamespace', 'public');

    if (functionsError) {
      console.log('❌ Error checking functions:', functionsError);
    } else {
      console.log(`⚡ Found ${functions.length} profile functions:`);
      functions.forEach((func, index) => {
        console.log(`🔧 Function ${index + 1}:`, func.proname);
      });
    }

  } catch (error) {
    console.log('💥 Database check failed:', error);
  }
}

checkDatabaseState();
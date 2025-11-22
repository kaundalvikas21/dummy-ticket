// Complete Supabase Auth Flow Test for New Project
import { createClient } from '@supabase/supabase-js';

// Read environment variables
const fs = await import('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');

const supabaseUrl = envLines.find(line => line.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1];
const supabaseAnonKey = envLines.find(line => line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='))?.split('=')[1];
const supabaseServiceKey = envLines.find(line => line.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1];

console.log('🚀 TESTING COMPLETE AUTH FLOW');
console.log('🔧 Project URL:', supabaseUrl);
console.log('🔑 Keys loaded:', supabaseAnonKey ? '✅' : '❌', supabaseServiceKey ? '✅' : '❌');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthFlow() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  console.log('\n📧 Step 1: Testing User Registration...');

  try {
    // Test 1: User Registration
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          role: 'user'
        }
      }
    });

    if (signUpError) {
      console.log('❌ Registration failed:', signUpError.message);
      return false;
    }

    console.log('✅ Registration successful!');
    console.log('📧 User created:', signUpData.user.email);
    console.log('🆔 User ID:', signUpData.user.id);

    // Test 2: Check if profile was created automatically
    console.log('\n👤 Step 2: Checking Auto-Created Profile...');

    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Try to get user profile (this will test our trigger)
    const { data: profileData, error: profileError } = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?auth_user_id=eq.${signUpData.user.id}`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      }
    ).then(res => res.json());

    if (profileError || !profileData || profileData.length === 0) {
      console.log('❌ Profile creation failed');
      console.log('Error:', profileError);
      return false;
    }

    const profile = profileData[0];
    console.log('✅ Profile created automatically!');
    console.log('👤 Profile ID:', profile.id);
    console.log('👤 Profile Name:', profile.first_name, profile.last_name);

    // Test 3: User Login
    console.log('\n🔐 Step 3: Testing User Login...');

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('❌ Login failed:', signInError.message);
      return false;
    }

    console.log('✅ Login successful!');
    console.log('🆔 Session User:', signInData.user.email);

    // Test 4: User Logout
    console.log('\n🚪 Step 4: Testing User Logout...');

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.log('❌ Logout failed:', signOutError.message);
      return false;
    }

    console.log('✅ Logout successful!');

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ User Registration works');
    console.log('✅ Profile Auto-Creation works');
    console.log('✅ User Login works');
    console.log('✅ User Logout works');

    return true;

  } catch (error) {
    console.log('❌ Auth test failed:', error.message);
    console.log('Full error:', error);
    return false;
  }
}

// Run the test
testAuthFlow().then(success => {
  if (success) {
    console.log('\n🚀 NEW PROJECT AUTHENTICATION IS FULLY WORKING! 🎯');
    console.log('Your cleaned codebase is ready for production!');
  } else {
    console.log('\n❌ AUTHENTICATION TEST FAILED');
    console.log('Check the errors above and fix any issues');
  }
}).catch(error => {
  console.log('\n💥 TEST CRASHED:', error.message);
});
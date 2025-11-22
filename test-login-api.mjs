// Test Login API Endpoint
async function testLoginAPI() {
  const testEmail = 'api-test-1763803902409@example.com';
  const testPassword = 'TestPassword123!';

  console.log('🔐 TESTING LOGIN API ENDPOINT');

  try {
    // Test the login API endpoint
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const data = await response.json();

    console.log('📡 Login API Response status:', response.status);
    console.log('📡 Login API Response data:', data);

    if (response.ok && data.success) {
      console.log('✅ Login API successful!');
      console.log('👤 User logged in:', data.user?.email);
    } else {
      console.log('❌ Login API failed');
      console.log('Error:', data.error || 'Unknown error');
    }

  } catch (error) {
    console.log('💥 Login API test failed:', error.message);
  }
}

testLoginAPI();
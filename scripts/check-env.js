#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 *
 * This script validates that all required environment variables are set
 * before running the application in development or production.
 */

const requiredVariables = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    validator: (value) => {
      if (!value) return false;
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && url.hostname.includes('supabase.co');
      } catch {
        return false;
      }
    },
    example: 'https://your-project-id.supabase.co'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    validator: (value) => {
      if (!value) return false;
      return value.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    },
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (required for admin operations)',
    validator: (value) => {
      if (!value) return false;
      return value.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    },
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
];

const optionalVariables = [
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe publishable key (optional - for payments)',
    validator: (value) => {
      if (!value || value === 'pk_test_your_stripe_publishable_key_here') return true;
      return value.startsWith('pk_test_') || value.startsWith('pk_live_');
    },
    example: 'pk_test_your_stripe_publishable_key_here'
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key (optional - for payments)',
    validator: (value) => {
      if (!value || value === 'sk_test_your_stripe_secret_key_here') return true;
      return value.startsWith('sk_test_') || value.startsWith('sk_live_');
    },
    example: 'sk_test_your_stripe_secret_key_here'
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook secret (optional - for payments)',
    validator: (value) => {
      if (!value || value === 'whsec_your_stripe_webhook_secret_here') return true;
      return value.startsWith('whsec_');
    },
    example: 'whsec_your_stripe_webhook_secret_here'
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    description: 'Application URL',
    validator: (value) => {
      if (!value) return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    example: 'http://localhost:3000'
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    description: 'Site URL',
    validator: (value) => {
      if (!value) return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    example: 'http://localhost:3000'
  },
  {
    name: 'TEST_USER_PASSWORD',
    description: 'Test user password (for development/testing)',
    validator: (value) => {
      if (!value || value === 'your_secure_test_password_here') {
        return process.env.NODE_ENV !== 'test';
      }
      return value.length >= 8;
    },
    example: 'TestUser123456!'
  }
];

function logError(message) {
  console.error('❌', message);
}

function logSuccess(message) {
  console.log('✅', message);
}

function logWarning(message) {
  console.log('⚠️', message);
}

function logInfo(message) {
  console.log('ℹ️', message);
}

function validateVariable(variable, isRequired = true) {
  const value = process.env[variable.name];
  const isMissing = !value;
  const isPlaceholder = value && (
    value.includes('your_') ||
    value.includes('placeholder') ||
    value === variable.example
  );

  if (isRequired) {
    if (isMissing) {
      logError(`${variable.name}: Missing required variable`);
      logInfo(`  Description: ${variable.description}`);
      logInfo(`  Example: ${variable.example}`);
      return false;
    }

    if (isPlaceholder) {
      logError(`${variable.name}: Contains placeholder value`);
      logInfo(`  Replace with your actual ${variable.description.toLowerCase()}`);
      logInfo(`  Example: ${variable.example}`);
      return false;
    }
  } else {
    if (isMissing) {
      logWarning(`${variable.name}: Optional variable not set`);
      logInfo(`  Description: ${variable.description}`);
      return true; // Optional variables don't fail validation
    }

    if (isPlaceholder) {
      logWarning(`${variable.name}: Contains placeholder value (OK for development)`);
      logInfo(`  Description: ${variable.description}`);
      return true;
    }
  }

  if (!variable.validator(value)) {
    logError(`${variable.name}: Invalid format`);
    logInfo(`  Description: ${variable.description}`);
    logInfo(`  Current value: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
    logInfo(`  Example: ${variable.example}`);
    return false;
  }

  logSuccess(`${variable.name}: Valid ${isRequired ? 'required' : 'optional'} variable`);
  return true;
}

function main() {
  console.log('🔍 Environment Variable Validation\n');

  let hasErrors = false;
  let warnings = 0;

  // Validate required variables
  console.log('📋 Required Variables:');
  for (const variable of requiredVariables) {
    if (!validateVariable(variable, true)) {
      hasErrors = true;
    }
  }

  console.log('\n📋 Optional Variables:');
  for (const variable of optionalVariables) {
    const value = process.env[variable.name];
    if (!value || value.includes('your_') || value === variable.example) {
      warnings++;
    }
    validateVariable(variable, false);
  }

  console.log('\n📊 Summary:');

  if (hasErrors) {
    logError('Environment validation failed!');
    logInfo('Please fix the errors above before running the application.');
    logInfo('\n🚀 Quick Setup:');
    logInfo('1. Copy .env.example to .env.local');
    logInfo('2. Fill in your actual credentials');
    logInfo('3. Run this script again: npm run check-env');
    process.exit(1);
  }

  if (warnings > 0) {
    logWarning(`${warnings} optional variable(s) need attention`);
    logInfo('The application will run, but some features may not work properly.');
  }

  logSuccess('Environment validation passed!');
  logInfo('All required variables are properly configured.');

  if (process.env.NODE_ENV === 'development') {
    logInfo('\n💡 Development Tips:');
    logInfo('- Run "npm run check-env" before starting development');
    logInfo('- Keep your .env.local file secure and never commit it');
    logInfo('- Use different credentials for development and production');
  }

  process.exit(0);
}

// Run validation
main();
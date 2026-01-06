# Architecture Analysis and Implementation Plan
## VisaFly - Dummy Ticket Booking System

**Date:** 2026-01-05
**Status:** Ready for Review
**Version:** 1.0

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current Architecture Deep Dive](#current-architecture-deep-dive)
3. [Issues Identified](#issues-identified)
4. [Implementation Plan](#implementation-plan)
5. [Testing Strategy](#testing-strategy)
6. [Rollback Plan](#rollback-plan)

---

## Executive Summary

### Project Overview
- **Framework:** Next.js 15.5.6 with App Router
- **Frontend:** React 19.1.0, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Payment:** Stripe
- **State:** Context-based (Locale, Currency, Auth)

### Key Findings
| Category | Status | Priority |
|----------|--------|----------|
| Authentication Flow | ⚠️ Needs improvement | HIGH |
| Middleware Performance | ⚠️ Database queries on every request | HIGH |
| Security | ⚠️ No rate limiting | MEDIUM |
| Code Quality | ✅ Generally good | LOW |
| State Management | ✅ Working well | - |

---

## Current Architecture Deep Dive

### 1. Authentication Flow Analysis

#### Flow Diagram
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CLIENT SIDE                     SERVER SIDE                    DATABASE      │
│                                                                              │
│  ┌──────────┐                  ┌────────────┐                ┌──────────┐   │
│  │  User    │───POST /login───▶│ middleware  │────check──────▶│ Supabase │   │
│  │ submits  │                  │            │                │  Auth    │   │
│  │ credentials│                 │  (skipped)  │                │          │   │
│  └──────────┘                  └────────────┘                └──────────┘   │
│        │                                                          │         │
│        │                              ┌────────────┐             │         │
│        └─────────────POST /login─────▶│  API Route  │◀────────────┘         │
│                                     │  /login     │                           │
│                                     └────────────┘                             │
│                                            │                                   │
│                                     ┌─────────────┐                            │
│                                     │ createClient│                            │
│                                     │ (server.js) │                            │
│                                     └─────────────┘                            │
│                                            │                                   │
│                                            v                                   │
│                                     ┌─────────────┐                            │
│                                     │ supabase.   │                            │
│                                     │ auth.       │                            │
│                                     │ signInWith  │                            │
│                                     │ Password()  │                            │
│                                     └─────────────┘                            │
│                                            │                                   │
│         ┌──────────────────────────────────┘                                   │
│         │                                                                      │
│         v                                                                       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────────────┐    │
│  │ AuthContext  │◀─────│   Response   │      │  Create user_profiles     │    │
│  │ stores user  │      │  user+profile│      │  if not exists           │    │
│  │ & profile    │      └──────────────┘      └──────────────────────────┘    │
│  └──────────────┘                                                             │
│         │                                                                      │
│         │ GET /api/auth/profile (Bearer token)                                 │
│         v                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │ API Route uses createSupabaseClientWithAuth() from auth-helper.js     │    │
│  │                                                                         │    │
│  │ ⚠️ ISSUE: Uses access_token as refresh_token (line 100)                 │    │
│  │                                                                         │    │
│  │   supabase.auth.setSession({                                            │    │
│  │     access_token: token,                                                │    │
│  │     refresh_token: token  // ❌ WRONG!                                  │    │
│  │   })                                                                    │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Current Authentication Components

| File | Purpose | Pattern Used |
|------|---------|--------------|
| `contexts/auth-context.jsx` | Client-side auth state | React Context + Supabase Browser Client |
| `lib/auth-helper.js` | Server-side auth helpers | Bearer token extraction + manual session set |
| `lib/supabase/client.js` | Browser Supabase client | `@supabase/ssr` createBrowserClient |
| `lib/supabase/server.js` | Server Supabase client | `@supabase/ssr` createServerClient with cookies |
| `middleware.js` | Route protection | Server client with role checking |

#### Session Management
- **Browser:** Supabase SSR handles cookies automatically
- **Server (RSC):** Uses cookies from `next/headers`
- **API Routes:** Uses Bearer tokens from Authorization header

---

### 2. Middleware Analysis

#### Current Middleware Flow
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MIDDLEWARE FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Incoming Request                                                            │
│         │                                                                    │
│         v                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ middleware.js                                                         │    │
│  │                                                                       │    │
│  │  1. createClient() - Gets Supabase server client with cookies        │    │
│  │  2. getUser() - Gets user from session                                │    │
│  │  3. ⚠️ ISSUE: Queries user_profiles table for role (lines 19-27)      │    │
│  │                                                                       │    │
│  │     const { data: profile } = await supabaseAdmin                     │    │
│  │       .from('user_profiles')                                          │    │
│  │       .select('role')                                                 │    │
│  │       .eq('auth_user_id', user.id)                                    │    │
│  │       .single()                                                       │    │
│  │                                                                       │    │
│  │  4. Checks protected routes based on role                            │    │
│  │  5. Redirects if unauthorized                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Performance Impact
- **Current:** DB query on EVERY protected route request
- **Impact:** ~100-300ms added latency per request
- **Scalability:** Will degrade with increased traffic

#### Route Protection Rules
```javascript
const protectedRoutes = {
  '/admin': 'admin',
  '/vendor': 'vendor',
  '/user': 'user',
  '/buy-ticket': 'any'  // Any authenticated user
}
```

---

### 3. Context Providers Analysis

#### Auth Context (`contexts/auth-context.jsx`)
```
State:
  - user: Supabase auth user object
  - profile: Extended profile from user_profiles table
  - loading: Initial auth check state
  - profileVersion: Incremented on profile updates

Methods:
  - signIn(): Calls /api/auth/login
  - signUp(): Calls /api/auth/register
  - signOut(): Calls supabase.auth.signOut()
  - updateProfile(): Calls /api/auth/profile/update
  - refreshProfile(): Refetches from /api/auth/profile

Issues:
  ✅ Generally well-structured
  ⚠️ Profile fetch happens via separate API call (could be optimized)
```

#### Currency Context (`contexts/currency-context.jsx`)
```
State:
  - currency: Selected currency code
  - rates: Exchange rate object
  - isConverting: Loading state for UX

Features:
  - Auto-detects currency from IP (ipinfo.io)
  - Persists to localStorage
  - Smooth loading animation

Issues:
  ⚠️ API key exposed in client code (line 60)
  ✅ Has proper caching with Next.js revalidate
```

#### Locale Context (`contexts/locale-context.jsx`)
```
State:
  - locale: Selected locale code
  - isLoading: Initial load state

Features:
  - URL param support
  - localStorage persistence
  - Document lang attribute update

Issues:
  ✅ Clean implementation
```

---

### 4. API Routes Analysis

#### Authentication Patterns

| Pattern | Files | Status |
|---------|-------|--------|
| Server Client (cookies) | `/api/auth/login`, `/api/auth/register` | ✅ Working |
| Bearer Token | `/api/auth/profile`, `/api/auth/profile/update` | ⚠️ Has refresh issue |
| withAuth HOC | Not actively used | ⚠️ Underutilized |

#### API Route Flow Examples

**Login Route** (`/api/auth/login/route.js`):
```
1. Validates email/password
2. Calls supabase.auth.signInWithPassword()
3. Fetches/creates user_profiles record
4. Returns user + profile data
5. AuthContext stores in state
```

**Profile Route** (`/api/auth/profile/route.js`):
```
1. Calls createSupabaseClientWithAuth(request)
2. Extracts Bearer token
3. ⚠️ Sets session with access_token as refresh_token
4. Queries user_profiles table
5. Returns profile data
```

---

## Issues Identified

### Critical Issues (Must Fix)

#### 1. Token Refresh Bypass - `lib/auth-helper.js:97-100`
**Severity:** 🔴 HIGH
**Impact:** Authentication fails after ~1 hour (access token expiry)

```javascript
// CURRENT (BROKEN):
supabase.auth.setSession({
  access_token: token,
  refresh_token: token  // ❌ Using access token as refresh token
})

// This breaks Supabase's automatic token refresh mechanism
// When access token expires, there's no valid refresh token to get a new one
```

**Root Cause:**
- API requests only send access token in Authorization header
- No refresh token is available on the server side
- Workaround bypasses refresh mechanism entirely

**Fix Required:**
- Use Supabase's getSession() which has refresh token in cookies
- For API routes, implement a proper token refresh flow

---

#### 2. Database Query in Middleware - `middleware.js:19-27`
**Severity:** 🔴 HIGH
**Impact:** 100-300ms added latency on every protected route

```javascript
// CURRENT (INEFFICIENT):
// Middleware queries user_profiles table on every request
const { data: profile } = await supabaseAdmin
  .from('user_profiles')
  .select('role')
  .eq('auth_user_id', user.id)
  .single()

if (profile?.role) {
  userRole = profile.role
}
```

**Root Cause:**
- Role stored in both `auth.users.app_metadata.role` AND `user_profiles.role`
- Middleware checks database instead of using JWT metadata

**Fix Required:**
- Rely on `user.app_metadata.role` which is already in the JWT
- Remove DB query from middleware
- Ensure app_metadata is always synced when role changes

---

### High Priority Issues

#### 3. No Rate Limiting on Auth Endpoints
**Severity:** 🟠 MEDIUM-HIGH
**Impact:** Vulnerable to brute force attacks

**Affected Endpoints:**
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/check-email`

**Fix Required:**
- Implement in-memory rate limiting
- Consider adding Redis for production

---

#### 4. Hardcoded Production URL - `app/layout.js:23`
**Severity:** 🟠 MEDIUM
**Impact:** SEO issues, incorrect canonical URLs

```javascript
// CURRENT:
canonical: "http://192.168.29.26:3000/"

// SHOULD BE:
canonical: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
```

---

### Medium Priority Issues

#### 5. Inconsistent Supabase Client Imports
**Severity:** 🟡 MEDIUM
**Impact:** Maintenance confusion

```javascript
// Mix of imports across files:
import { createClient } from '@supabase/supabase-js'  // lib/auth-helper.js
import { createClient } from '@/lib/supabase/server'    // API routes
import { createClient } from '@/lib/supabase/client'    // Components
```

**Recommendation:**
- Use `@supabase/ssr` consistently for server components
- Keep browser client for client components only

---

#### 6. Exchange Rate API Key Exposure
**Severity:** 🟡 MEDIUM
**Impact:** API key visible in client bundle

```javascript
// contexts/currency-context.jsx:60
const token = process.env.NEXT_PUBLIC_IPINFO_TOKEN || '91287bf4fddcdf'
```

**Note:** Using NEXT_PUBLIC_ makes it available to clients.
Currently has fallback hardcoded key.

---

### Low Priority Issues

#### 7. Unused withAuth HOC
**Severity:** 🟢 LOW
**Impact:** Code maintenance

The `withAuth()` helper in `lib/auth-helper.js` is defined but not used in API routes.

---

#### 8. No CSRF Protection
**Severity:** 🟢 LOW
**Impact:** Potential CSRF attacks

**Current:** No CSRF token implementation
**Recommendation:** Next.js 15 has built-in CSRF protection for same-origin requests

---

## Implementation Plan

### Phase 1: Fix Token Refresh (CRITICAL)

**Goal:** Enable proper token refresh for authenticated API requests

**Approach:**
Use the `@supabase/ssr` package's `getSession()` method which already has refresh tokens in cookies.

**Files to Modify:**
1. `lib/auth-helper.js` - Fix `createSupabaseClientWithAuth()`

**Changes:**
```javascript
// lib/auth-helper.js
export function createSupabaseClientWithAuth(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Create client without auth first
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // For API routes, check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)

    // Validate the token but don't set full session
    // Supabase will validate and use the token for this request
    supabase.auth.setSession({
      access_token: token,
      // Don't set refresh_token - let it validate with access token only
      // The refresh happens automatically via cookies in getSession()
    })
  }

  return supabase
}

// Better alternative for API routes: Use cookies directly
export async function createSupabaseClientForAPI() {
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**API Route Updates:**
Update API routes to use the new `createSupabaseClientForAPI()` instead of `createSupabaseClientWithAuth()`.

---

### Phase 2: Optimize Middleware (CRITICAL)

**Goal:** Remove database queries from middleware for better performance

**Approach:**
Rely on `user.app_metadata.role` which is already in the JWT token.

**Files to Modify:**
1. `middleware.js`

**Changes:**
```javascript
// middleware.js - OPTIMIZED VERSION
export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Create Supabase client for middleware
  const supabase = await createClient()

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // ✅ FIXED: Use role from app_metadata (already in JWT, no DB query needed)
  const userRole = user?.app_metadata?.role || 'user'

  // Define protected routes and their required roles
  const protectedRoutes = {
    '/admin': 'admin',
    '/vendor': 'vendor',
    '/user': 'user',
    '/buy-ticket': 'any'
  }

  // Define auth routes (redirect if already authenticated)
  const authRoutes = ['/login', '/register']

  // Check if current path is a protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some(route =>
    pathname.startsWith(route)
  )

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))

  // If accessing protected route without authentication, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth route while authenticated, redirect to role-appropriate dashboard
  if (isAuthRoute && user && userRole) {
    const dashboardUrl = new URL(`/${userRole}`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // If accessing protected route, check role-based access
  if (isProtectedRoute && user && userRole) {
    for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && requiredRole !== 'any' && userRole !== requiredRole) {
        const correctDashboard = new URL(`/${userRole}`, request.url)
        return NextResponse.redirect(correctDashboard)
      }
    }
  }

  // If no redirects needed, continue with the request and refresh session
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  return response
}
```

**Expected Impact:**
- **Before:** ~100-300ms per protected route
- **After:** ~10-20ms per protected route
- **Improvement:** ~90% reduction in middleware latency

---

### Phase 3: Add Rate Limiting (HIGH PRIORITY)

**Goal:** Protect auth endpoints from brute force attacks

**Approach:**
Implement in-memory rate limiting using a Map.

**Files to Create:**
1. `lib/rate-limit.js`

**Changes:**
```javascript
// lib/rate-limit.js - NEW FILE
/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or Upstash
 */

const rateLimitMap = new Map()

/**
 * Check if a request should be rate limited
 * @param {string} identifier - IP address or user ID
 * @param {number} limit - Max requests allowed
 * @param {number} window - Time window in milliseconds
 * @returns {{ allowed: boolean, resetAt?: number }}
 */
export function checkRateLimit(identifier, limit = 5, window = 60000) {
  const now = Date.now()

  // Get existing requests for this identifier
  const userRequests = rateLimitMap.get(identifier) || []

  // Filter out requests outside the time window
  const recentRequests = userRequests.filter(time => now - time < window)

  // Check if limit exceeded
  if (recentRequests.length >= limit) {
    return {
      allowed: false,
      resetAt: recentRequests[0] + window
    }
  }

  // Add current request
  recentRequests.push(now)
  rateLimitMap.set(identifier, recentRequests)

  // Cleanup old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, requests] of rateLimitMap.entries()) {
      const validRequests = requests.filter(time => now - time < window)
      if (validRequests.length === 0) {
        rateLimitMap.delete(key)
      } else {
        rateLimitMap.set(key, validRequests)
      }
    }
  }

  return { allowed: true }
}

/**
 * Express middleware style rate limiter for Next.js API routes
 */
export function withRateLimit(handler, options = {}) {
  const {
    limit = 5,
    window = 60000,
    identifierGenerator = (req) => req.headers.get('x-forwarded-for') || 'unknown'
  } = options

  return async (request) => {
    const identifier = identifierGenerator(request)
    const result = checkRateLimit(identifier, limit, window)

    if (!result.allowed) {
      const resetDate = new Date(result.resetAt)
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many attempts. Please try again later.',
          retryAfter: retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString()
          }
        }
      )
    }

    return handler(request)
  }
}
```

**Apply to Login Route:**
```javascript
// app/api/auth/login/route.js - UPDATED
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase'
import { withRateLimit } from '@/lib/rate-limit'

// Apply rate limiting: 5 attempts per minute
const rateLimitedLogin = withRateLimit(handleLogin, {
  limit: 5,
  window: 60000
})

async function handleLogin(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // ... rest of login logic remains the same
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

export { rateLimitedLogin as POST }
```

---

### Phase 4: Fix Hardcoded URLs (MEDIUM PRIORITY)

**Goal:** Use environment variables for production URLs

**Files to Modify:**
1. `app/layout.js`

**Changes:**
```javascript
// app/layout.js - UPDATED
export const metadata = {
  title: "VisaFly | Flight Reservations for Visa Applications",
  description:
    "Secure verifiable flight reservations for visa applications in minutes. Trusted by 50,000+ travelers worldwide, we provide reliable dummy tickets and flight itineraries to simplify your visa approval process.",
  keywords:
    "dummy ticket, flight reservation, visa application, travel booking, PNR code",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: "VisaFly" }],
  publisher: "VisaFly",
}
```

**Add to .env.local:**
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

### Phase 5: Code Quality Improvements (LOW PRIORITY)

**Goal:** Consistent code patterns across the codebase

**Changes:**

1. **Standardize Supabase Imports:**
   - Server components: Use `@/lib/supabase/server`
   - Client components: Use `@/lib/supabase/client`
   - API routes: Use `@/lib/supabase/server` (has cookies)

2. **Remove Deprecated Import:**
   ```javascript
   // lib/auth-helper.js - CHANGE
   // FROM:
   import { createClient } from '@supabase/supabase-js'

   // TO:
   import { createClient } from '@/lib/supabase/server'
   ```

---

## Testing Strategy

### Pre-Implementation Testing
1. ✅ Verify current auth flow works
2. ✅ Document current behavior
3. ✅ Create backup of working code

### Post-Implementation Testing

#### Authentication Flow Tests
```
Test Matrix:
┌────────────────────────────────────────────────────────────┐
│ Test Case                    │ Expected Result            │
├────────────────────────────────────────────────────────────┤
│ User login                   │ Success, redirect to role   │
│ Token refresh (after 1hr)    │ Auto-refresh, no logout     │
│ Protected route access       │ Works with valid token      │
│ Expired token access         │ Redirect to login           │
│ Role-based routing           │ Correct dashboard per role  │
│ Profile update               │ Success, data synced        │
└────────────────────────────────────────────────────────────┘
```

#### Performance Tests
```
Metrics to Measure:
- Middleware response time (before/after)
- API route response time (before/after)
- Database queries count reduction
- Lighthouse performance score
```

#### Security Tests
```
Security Checks:
- Rate limiting activates after 5 failed logins
- Rate limiting resets after 1 minute
- Different IPs tracked independently
- Token refresh works properly
- Session persistence across refreshes
```

### Testing Checklist

- [ ] Login flow works
- [ ] Register flow works
- [ ] Logout works
- [ ] Profile update works
- [ ] Admin routes protected
- [ ] Vendor routes protected
- [ ] User routes protected
- [ ] Rate limiting works
- [ ] Token refresh works (test after 1 hour or simulate)
- [ ] Middleware doesn't query database
- [ ] No regressions in existing functionality

---

## Rollback Plan

If any issue occurs during implementation:

### Quick Rollback Commands
```bash
# Revert all changes
git checkout HEAD -- lib/auth-helper.js
git checkout HEAD -- middleware.js
git checkout HEAD -- app/api/auth/login/route.js
git checkout HEAD -- app/layout.js

# Remove new files
rm lib/rate-limit.js

# Restart dev server
npm run dev
```

### Rollback Decision Tree
```
Issue Detected
    │
    ├─▶ Critical (login broken)
    │       └─▶ Immediate rollback, investigate, retry
    │
    ├─▶ High (performance degraded)
    │       └─▶ Rollback specific change, fix, retry
    │
    └─▶ Low (minor issue)
            └─▶ Document, fix in next iteration
```

---

## Implementation Order

### Sequential Implementation (Recommended)

```
Step 1: Create rate-limit utility (no breaking changes)
        ↓
Step 2: Fix auth-helper.js token refresh (backward compatible)
        ↓
Step 3: Update middleware to remove DB queries (needs verification)
        ↓
Step 4: Apply rate limiting to auth endpoints
        ↓
Step 5: Fix hardcoded URLs
        ↓
Step 6: Testing and verification
        ↓
Step 7: Deploy to staging
        ↓
Step 8: Monitor and validate
        ↓
Step 9: Production deployment
```

### Why This Order?

1. **Rate-limit utility first** - New file, no existing code affected
2. **Token refresh second** - Critical fix, backward compatible
3. **Middleware third** - Has highest performance impact but needs role in app_metadata
4. **Apply rate limiting** - Non-breaking addition
5. **Hardcoded URLs** - Low risk, easy to verify
6. **Testing** - Comprehensive verification before deployment

---

## Success Criteria

### Performance Metrics
- [ ] Middleware latency reduced by >80%
- [ ] No database queries in middleware
- [ ] API response time <200ms average

### Security Metrics
- [ ] Rate limiting active on auth endpoints
- [ ] Token refresh working properly
- [ ] No auth bypass vulnerabilities

### Functionality Metrics
- [ ] All auth flows working
- [ ] No regressions in existing features
- [ ] User experience unchanged or improved

---

## Next Steps

### Before Implementation
1. ✅ Review this plan thoroughly
2. ✅ Confirm understanding of changes
3. ✅ Ask any clarification questions

### During Implementation
1. Implement changes sequentially
2. Test after each change
3. Document any deviations from plan

### After Implementation
1. Run full test suite
2. Monitor performance metrics
3. Check for any edge cases

---

## Appendix

### Environment Variables Needed
```bash
# Add to .env.local:
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_EXCHANGE_RATE_API_URL=https://v6.exchangerate-api.com
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_api_key
NEXT_PUBLIC_IPINFO_TOKEN=your_ipinfo_token
```

### Database Schema Notes
- `user_profiles.role` should mirror `auth.users.app_metadata.role`
- Consider adding a database trigger to keep them in sync

### Monitoring Recommendations
- Track middleware response times
- Monitor rate limit hits
- Alert on unusual auth failure patterns

---

**Document Status:** Ready for Review
**Last Updated:** 2026-01-05
**Next Review:** After implementation completion

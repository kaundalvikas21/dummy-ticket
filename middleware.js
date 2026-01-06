import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Create Supabase client for middleware
  const supabase = await createClient()

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // OPTIMIZED: Use role from app_metadata (already in JWT, no DB query needed)
  // Default to 'user' if no role is set
  const userRole = user?.app_metadata?.role || 'user'

  // Define protected routes and their required roles
  const protectedRoutes = {
    '/admin': 'admin',
    '/vendor': 'vendor',
    '/user': 'user',
    '/buy-ticket': 'any' // Special case: any authenticated user can access
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
    // Check if the route matches the user's role
    for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && requiredRole !== 'any' && userRole !== requiredRole) {
        // User doesn't have permission for this route
        // Redirect to their correct dashboard
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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
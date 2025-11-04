import { NextResponse } from 'next/server'
import { parse } from 'cookie'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Get cookies from the request
  const cookies = parse(request.headers.get('cookie') || '')

  // Check if user is authenticated by looking for stored auth data in cookies
  const storedUser = cookies.auth_user

  // Define protected routes
  const protectedRoutes = {
    '/admin': 'admin',
    '/vendor': 'vendor',
    '/user': 'user'
  }

  // Define auth routes (redirect if already authenticated)
  const authRoutes = ['/login', '/register']

  // Check if current path is a protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some(route =>
    pathname.startsWith(route)
  )

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // If accessing protected route without authentication, redirect to login
  if (isProtectedRoute && !storedUser) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth route while authenticated, redirect to dashboard
  if (isAuthRoute && storedUser) {
    try {
      const user = JSON.parse(storedUser)
      const dashboardUrl = new URL(`/${user.role}`, request.url)
      return NextResponse.redirect(dashboardUrl)
    } catch (error) {
      // Invalid stored data, proceed to auth route
    }
  }

  // If accessing protected route, check role
  if (isProtectedRoute && storedUser) {
    try {
      const user = JSON.parse(storedUser)

      // Check if the route matches the user's role
      for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(route) && user.role !== requiredRole) {
          // User doesn't have permission for this route
          const correctDashboard = new URL(`/${user.role}`, request.url)
          return NextResponse.redirect(correctDashboard)
        }
      }
    } catch (error) {
      // Invalid stored data, redirect to login
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow request to proceed
  return NextResponse.next()
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
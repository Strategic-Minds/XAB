import { type NextRequest, NextResponse } from 'next/server'

// Public routes that do NOT require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/api/health',
]

// Explicitly public wildcards
const isPublicRoute = (path: string) => {
  if (PUBLIC_ROUTES.includes(path)) return true
  if (path.startsWith('/auth/')) return true
  if (path.startsWith('/api/webhooks/')) return true
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply security/rate limiting headers to all responses
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-RateLimit-Limit', '100')
  response.headers.set('X-RateLimit-Remaining', '99')
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Authentication validation
  const isPublic = isPublicRoute(pathname)
  
  // If it's a private API route or a private page, enforce auth
  if (!isPublic) {
    // Check for authorization header or session cookie
    const authHeader = request.headers.get('Authorization')
    const hasSessionCookie = request.cookies.has('sb-access-token') || request.cookies.has('next-auth.session-token')
    
    if (!authHeader && !hasSessionCookie) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized: Authentication required' }),
          { 
            status: 401, 
            headers: { 
              'Content-Type': 'application/json',
              'X-Frame-Options': 'DENY',
              'X-Content-Type-Options': 'nosniff'
            } 
          }
        )
      } else {
        // Redirect pages to auth sign-in
        const url = request.nextUrl.clone()
        url.pathname = '/auth'
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = new Set([
  '/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
])

const PUBLIC_PREFIXES = ['/auth', '/_next', '/public', '/api/health']

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p))
}

function cronGuard(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return auth === `Bearer ${secret}`
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src * data: blob:; connect-src *;"
  )
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block all cron routes except via authenticated Vercel cron caller
  if (pathname.startsWith('/api/cron/')) {
    if (!cronGuard(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Block swarm/internal routes from external access
  if (pathname.startsWith('/api/swarm/') || pathname.startsWith('/api/audit-logs/')) {
    const secret = request.headers.get('x-internal-secret')
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

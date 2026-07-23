/** @type {import('next').NextConfig} */
const nextConfig = {
  // HARDENED: TypeScript errors fail the build
  typescript: {
    ignoreBuildErrors: false,
  },
  // HARDENED: ESLint errors fail the build
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.vercel.app' },
      { protocol: 'https', hostname: '*.autobuilderos.com' },
      { protocol: 'https', hostname: '*.strategicmindsai.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'media.base44.com' },
    ],
  },
  experimental: {
    serverActions: {
      // HARDENED: restrict to known origins
      allowedOrigins: [
        'xab-system.vercel.app',
        'xps-intelligence.com',
        'autobuilderos.com',
        'strategicmindsai.com',
        'localhost:3000',
      ],
    },
  },
  // Security headers via next.config
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig

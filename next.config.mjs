/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  async headers() {
    const isProduction = process.env.NODE_ENV === 'production'

    return [
      {
        source: '/(.*)',
        headers: [
          // DNS Prefetch Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // HSTS - Only in production (breaks localhost HTTP)
          ...(isProduction ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }] : []),
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Content Security Policy - XSS Protection
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: blob: https: https://*.supabase.co;",
              "font-src 'self' data:;",
              "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.supabase.co wss://*.supabase.co ws://localhost:* ws://127.0.0.1:* https://ipinfo.io https://v6.exchangerate-api.com;",
              "frame-src 'self' https://js.stripe.com;",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self';",
              "frame-ancestors 'none';",
              // Only upgrade to HTTPS in production
              ...(isProduction ? ["upgrade-insecure-requests;"] : [])
            ].filter(Boolean).join(' ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;

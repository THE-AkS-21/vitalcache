/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Standalone output: copies only the files needed at runtime into .next/standalone.
    // Reduces Docker image size from ~1.2GB (with node_modules) to ~150MB.
    // Required for the multi-stage Dockerfile \u2014 the runner stage copies from this dir.
    output: 'standalone',

    experimental: {
        typedRoutes: true,
    },

    // Performance optimizations
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // NOTE: swcMinify removed \u2014 it was deprecated in Next.js 13.5+ and is now the
    // unconditional default. Keeping it generates a build warning with no effect.

    // Optimize production builds
    productionBrowserSourceMaps: false,

    // Image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },

    // Compression
    compress: true,

    // Headers for caching and security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                    {
                        // Content-Security-Policy in report-only mode.
                        //
                        // Report-only: violations are logged to the report-uri endpoint
                        // but NOT blocked \u2014 safe to ship immediately without breaking
                        // Tailwind inline styles, Framer Motion, or third-party fonts.
                        //
                        // Migration path:
                        //   1. Ship this, monitor the /api/csp-report endpoint for ~2 weeks
                        //   2. Tighten each directive based on real violation data
                        //   3. Rename to Content-Security-Policy to enforce
                        //
                        // TODO(security, pre-launch): Promote this header from
                        //   `Content-Security-Policy-Report-Only` to `Content-Security-Policy`
                        //   before the production launch milestone. Steps:
                        //     a) Review /api/csp-report logs for at least 2 weeks of traffic
                        //     b) Add nonces to script-src to eliminate 'unsafe-inline'/'unsafe-eval'
                        //        (requires Next.js nonce middleware — see Next.js docs on CSP)
                        //     c) Rename the key below to 'Content-Security-Policy'
                        //   Until this is done, CSP is MONITORING ONLY and will NOT block XSS.
                        //
                        // Current policy rationale:
                        //   default-src 'self'            — block everything not explicitly allowed
                        //   script-src  'self' 'unsafe-inline' 'unsafe-eval'
                        //               — Next.js requires these for hydration; tighten with nonces in v2
                        //   style-src   'self' 'unsafe-inline' fonts.googleapis.com
                        //               — Tailwind uses inline styles
                        //   font-src    fonts.gstatic.com
                        //               — Google Fonts CDN
                        //   img-src     'self' data: blob:
                        //               — data: for base64 avatars, blob: for print previews
                        //   connect-src 'self' <API_URL>
                        //               — XHR/fetch calls to the Go backend only
                        key: 'Content-Security-Policy-Report-Only',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: blob:",
                            `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}`,
                            "frame-ancestors 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                            "report-uri /api/csp-report",
                        ].join('; '),
                    },
                ],
            },
            {
                // Cache static assets for 1 year
                source: '/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ]
    },

    // Webpack optimizations
    webpack: (config, { dev, isServer }) => {
        // Optimize bundle size in production
        if (!dev && !isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // Vendor chunk for node_modules
                        vendor: {
                            name: 'vendor',
                            chunks: 'all',
                            test: /node_modules/,
                            priority: 20,
                        },
                        // Common chunk for shared code
                        common: {
                            minChunks: 2,
                            priority: 10,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                    },
                },
            }
        }

        return config
    },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        typedRoutes: true,
    },

    // Performance optimizations
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Enable SWC minification (faster than Terser)
    swcMinify: true,

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
                        // Separate framer-motion into its own chunk
                        framerMotion: {
                            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
                            name: 'framer-motion',
                            chunks: 'all',
                            priority: 30,
                        },
                    },
                },
            }
        }

        return config
    },
}

export default nextConfig

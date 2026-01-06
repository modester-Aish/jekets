/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hellstarofficialstudio.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hellstar.store',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hellstxr.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'payment.trapstarofficial.store',
        pathname: '/**',
      },
    ],
    // DISABLE image optimization to prevent timeout errors
    // Images will load directly from source (faster, no timeout)
    unoptimized: true,
    // Keep these for fallback
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  swcMinify: true,
  // Power optimization
  poweredByHeader: false,
}

module.exports = nextConfig


import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    // Enable optimizePackageImports for better tree-shaking
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // TypeScript configuration
  typescript: {
    // Don't build if there are TypeScript errors
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    // Don't build if there are ESLint errors
    ignoreDuringBuilds: false,
    // Only run ESLint on these directories
    dirs: ['src', 'pages', 'components', 'lib', 'app'],
  },
  
  // Image optimization
  images: {
    // Add common external image domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https', 
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  
  // Bundle analyzer (run with ANALYZE=true npm run build)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      )
      return config
    },
  }),
}

export default nextConfig
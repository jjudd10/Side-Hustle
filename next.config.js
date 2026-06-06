/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['10.0.0.158'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zgkvqfqqoqkyxqjpwolw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig

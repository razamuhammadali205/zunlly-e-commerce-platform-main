/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Image error fix karne ke liye
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // ✅ File size limit 5MB kar di
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
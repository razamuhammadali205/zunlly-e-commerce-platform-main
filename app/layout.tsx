// app/layout.tsx
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google' // ✅ Sirf Inter font use kar rahe hain
import './globals.css'
import { CartProvider } from '@/components/cart-provider'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ZUNLLY — Fragrance, made memorable',
  description: 'Discover considered fragrances by ZUNLLY.',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: 'white' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased bg-[#f8f6f0] text-[#292722]">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
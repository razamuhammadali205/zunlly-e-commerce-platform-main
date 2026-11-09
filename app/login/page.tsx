'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Login successful, wapas home page ya account page pe bhejo
      router.push('/')
      router.refresh() // Navbar ko update karne ke liye
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md bg-white border border-[#e6e1d9] p-8 md:p-10 shadow-sm">
        
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl tracking-[.25em] text-[#1a1a1a]">ZUNLLY</Link>
          <h1 className="mt-6 font-serif text-2xl text-[#292722]">Welcome Back</h1>
          <p className="mt-2 text-sm text-[#827b70]">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm p-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#827b70] mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#e6e1d9] bg-[#f8f7f4] p-3 pl-10 text-sm outline-none focus:border-[#b49a62] transition-colors" 
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#827b70] mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#e6e1d9] bg-[#f8f7f4] p-3 pl-10 text-sm outline-none focus:border-[#b49a62] transition-colors" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1d1c1a] text-white py-4 text-xs font-bold uppercase tracking-[.15em] hover:bg-[#b49a62] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#827b70]">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold text-[#b49a62] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
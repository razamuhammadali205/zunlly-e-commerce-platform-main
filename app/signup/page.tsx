'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Lock, Mail, User, Phone, AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('') 
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. ✅ Phone Number Check (Manual verification)
    // Hum check kar rahe hain ke kya koi user pehle se is phone number ke sath majood hai
    const { data: existingPhone } = await supabase
      .from('profiles') // Agar aapke paas profiles table hai, warna isko hata dein
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingPhone) {
      setError('This phone number is already registered. Please login instead.')
      setLoading(false)
      return
    }

    // 2. Supabase Signup (Email check Supabase khud karta hai)
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone, 
        },
      },
    })

    if (signupError) {
      // ✅ Email pehle se majood hai toh Supabase yeh error deta hai
      if (signupError.message.includes('already registered')) {
        setError('This email is already registered. Please login instead.')
      } else {
        setError(signupError.message)
      }
      setLoading(false)
      return
    }

    // 3. Success
    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md bg-white border border-[#e6e1d9] p-8 md:p-10 shadow-sm">
        
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl tracking-[.25em] text-[#1a1a1a]">ZUNLLY</Link>
          <h1 className="mt-6 font-serif text-2xl text-[#292722]">Create an Account</h1>
          <p className="mt-2 text-sm text-[#827b70]">Join ZUNLLY to track orders and more.</p>
        </div>

        {/* ✅ ERROR MESSAGE (With Login Link) */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-md flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{error}</p>
              {error.includes('already') && (
                <Link href="/login" className="mt-2 inline-block font-bold underline text-red-700 hover:text-red-900">
                  Click here to Login
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#827b70] mb-1.5">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-[#e6e1d9] bg-[#f8f7f4] p-3 pl-10 text-sm outline-none focus:border-[#b49a62] transition-colors" 
                placeholder="Ahmed Khan"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#827b70] mb-1.5">Email Address</label>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-[#827b70] mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="tel" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-[#e6e1d9] bg-[#f8f7f4] p-3 pl-10 text-sm outline-none focus:border-[#b49a62] transition-colors" 
                placeholder="03XX XXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#827b70] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#e6e1d9] bg-[#f8f7f4] p-3 pl-10 text-sm outline-none focus:border-[#b49a62] transition-colors" 
                placeholder="Min 6 characters"
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full bg-[#1d1c1a] text-white py-4 text-xs font-bold uppercase tracking-[.15em] hover:bg-[#b49a62] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Checking...' : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#827b70]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#b49a62] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
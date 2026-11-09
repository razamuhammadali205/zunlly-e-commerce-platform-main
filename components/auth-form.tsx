'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup' | 'forgot' | 'reset'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError(''); setMessage('')
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Enter a valid email address.')
      setBusy(false)
      return
    }
    if ((mode === 'signup' || mode === 'reset') && password.length < 8) {
      setError('Password must be at least 8 characters long.')
      setBusy(false)
      return
    }
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Enter your full name.')
      setBusy(false)
      return
    }
    const supabase = createClient()
    try {
      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
        if (authError) throw authError
        const redirectResponse = await fetch('/api/auth/redirect', { cache: 'no-store' })
        const redirectData = await redirectResponse.json()
        if (!redirectResponse.ok) throw new Error(redirectData.error || 'Unable to verify account role.')
        router.replace(redirectData.redirect)
        router.refresh()
      } else if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail, password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback` },
        })
        if (authError) throw authError
        setMessage(data.session ? 'Your account is ready.' : 'Check your email to verify your account.')
      } else if (mode === 'forgot') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password` })
        if (authError) throw authError
        setMessage('If an account exists for that email, a reset link is on its way.')
      } else {
        const { error: authError } = await supabase.auth.updateUser({ password })
        if (authError) throw authError
        setMessage('Password updated. You can now sign in.')
      }
    } catch (caught) {
      const text = caught instanceof Error ? caught.message.toLowerCase() : ''
      if (text.includes('password should be at least') || text.includes('weak')) setError('Password must be at least 8 characters long.')
      else if (text.includes('already registered') || text.includes('already exists')) setError('An account may already exist for this email. Try signing in or resetting your password.')
      else if (text.includes('email not confirmed')) setError('Please confirm your email address before signing in.')
      else if (text.includes('rate limit')) setError('Too many attempts. Please wait a moment and try again.')
      else if (mode === 'login' && (text.includes('invalid') || text.includes('credential'))) setError('Invalid email or password.')
      else setError('We could not complete that request. Please try again.')
    } finally { setBusy(false) }
  }

  const titles = { login: 'Welcome back', signup: 'Create your account', forgot: 'Reset your password', reset: 'Choose a new password' }
  return <form onSubmit={submit} className="mx-auto w-full max-w-md space-y-5 rounded-3xl border border-[#eadfce] bg-white p-7 shadow-[0_18px_60px_rgba(62,43,24,.08)]">
    <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c46c3b]">ZUNLLY account</p><h1 className="mt-2 font-serif text-3xl text-[#3b281c]">{titles[mode]}</h1></div>
    {mode === 'signup' && <label className="block text-sm text-[#6f5546]">Full name<input required value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e6d8c8] px-4 py-3 outline-none focus:border-[#c46c3b]" /></label>}
    {mode !== 'reset' && <label className="block text-sm text-[#6f5546]">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e6d8c8] px-4 py-3 outline-none focus:border-[#c46c3b]" /></label>}
    {mode !== 'forgot' && <label className="block text-sm text-[#6f5546]">Password<input required minLength={mode === 'login' ? undefined : 8} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e6d8c8] px-4 py-3 outline-none focus:border-[#c46c3b]" /></label>}
    <button type="submit" disabled={busy} aria-busy={busy} className="w-full rounded-xl bg-[#3b281c] px-4 py-3 font-semibold text-white transition hover:bg-[#c46c3b] disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Update password'}</button>
    {message && <p role="status" className="rounded-xl bg-[#edf4e8] p-3 text-sm text-[#48623f]">{message}</p>}
    {error && <p role="alert" className="rounded-xl bg-[#fff0eb] p-3 text-sm text-[#9d412e]">{error}</p>}
  </form>
}

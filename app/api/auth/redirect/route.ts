import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ redirect: '/auth/login' }, { status: 401 })
  const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to verify account role.' }, { status: 500 })
  return NextResponse.json({ redirect: profile?.role === 'admin' ? '/admin/products' : '/account' })
}

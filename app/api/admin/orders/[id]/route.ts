import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { supabase, user }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdmin()
  if ('response' in auth) return auth.response
  const { id } = await params
  const body = await request.json()
  const allowed = ['status', 'shipping_carrier', 'tracking_number', 'tracking_url']
  const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)))
  if (updates.status === 'shipped') updates.shipped_at = new Date().toISOString()
  if (updates.status === 'delivered') updates.delivered_at = new Date().toISOString()
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'No valid updates provided.' }, { status: 400 })
  const { data, error } = await auth.supabase.from('orders').update(updates).eq('id', id).select('id,status,shipping_carrier,tracking_number,tracking_url,shipped_at,delivered_at').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ order: data })
}

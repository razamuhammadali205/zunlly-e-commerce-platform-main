import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
  const { data, error } = await supabase.rpc('cancel_cod_order', { p_order_id: id })
  if (error) return NextResponse.json({ error: error.message.includes('unauthorized') ? 'You cannot cancel this order.' : 'This order can no longer be cancelled.' }, { status: 400 })
  return NextResponse.json({ cancelled: data })
}

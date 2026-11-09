'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateOrderTracking(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user is admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).maybeSingle()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const id = String(formData.get('id'))
  const status = String(formData.get('status'))
  const tracking_number = String(formData.get('tracking_number') || '').trim()
  const shipping_carrier = String(formData.get('shipping_carrier') || '').trim()

  const { error } = await supabase
    .from('orders')
    .update({ status, tracking_number, shipping_carrier })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Refresh pages taake customer aur admin dono ko naya status nazar aaye
  revalidatePath(`/admin/orders/${id}`)
  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
}
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const full_name = String(formData.get('full_name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, full_name, phone }, { onConflict: 'id' })

  if (error) {
    redirect('/account/settings?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/account/settings')
  redirect('/account/settings?updated=1')
}

export async function sendPasswordReset() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) redirect('/auth/login')

  await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/account/settings`,
  })

  redirect('/account/settings?reset=1')
}
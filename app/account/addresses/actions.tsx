'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function str(fd: FormData, key: string) {
  return String(fd.get(key) || '').trim()
}

export async function createAddress(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const payload = {
    user_id: user.id,
    full_name: str(formData, 'full_name'),
    phone: str(formData, 'phone'),
    address: str(formData, 'address'),
    city: str(formData, 'city'),
    postal_code: str(formData, 'postal_code'),
    is_default: formData.get('is_default') === 'on',
  }

  if (!payload.full_name || !payload.address || !payload.city) {
    redirect('/account/addresses?error=' + encodeURIComponent('Please fill all required fields'))
  }

  // if setting default, unset others
  if (payload.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
  }

  const { error } = await supabase.from('addresses').insert(payload)

  if (error) {
    redirect('/account/addresses?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/account/addresses')
  redirect('/account/addresses?updated=1')
}

export async function updateAddress(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const id = str(formData, 'id')
  if (!id) redirect('/account/addresses?error=Missing+id')

  const payload = {
    full_name: str(formData, 'full_name'),
    phone: str(formData, 'phone'),
    address: str(formData, 'address'),
    city: str(formData, 'city'),
    postal_code: str(formData, 'postal_code'),
    is_default: formData.get('is_default') === 'on',
  }

  if (payload.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
  }

  const { error } = await supabase
    .from('addresses')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect('/account/addresses?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/account/addresses')
  redirect('/account/addresses?updated=1')
}

export async function deleteAddress(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const id = str(formData, 'id')
  await supabase.from('addresses').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/account/addresses')
  redirect('/account/addresses?deleted=1')
}

export async function setDefaultAddress(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const id = str(formData, 'id')
  if (!id) redirect('/account/addresses')

  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', user.id)

  await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/account/addresses')
  redirect('/account/addresses')
}
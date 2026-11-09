'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  
  // Admin check
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).maybeSingle()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const name = String(formData.get('name'))
  const price = Number(formData.get('price'))
  const description = String(formData.get('description') || '')
  const category = String(formData.get('category') || 'Fragrance')
  const stock = Number(formData.get('stock'))
  const imageFile = formData.get('image') as File | null

  let image_url = ''

  // Image Upload Logic
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile)

    if (uploadError) throw new Error('Image upload failed: ' + uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)
      
    image_url = publicUrl
  }

  // ✅ Slug automatic generate karein
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') 
    + '-' + Math.random().toString(36).substring(2, 6);

  // ✅ Product Insert
  const { error } = await supabase.from('products').insert({
    name,
    slug, 
    price,
    description,
    category,
    stock,
    images: image_url ? [image_url] : [], 
    status: 'published'
  })

  // Agar koi column missing ho (jaise category_id) toh error handle karein
  if (error) {
    console.error("❌ PRODUCT INSERT ERROR:", error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/products')
  revalidatePath('/shop')
  redirect('/admin/products')
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient()
  const id = String(formData.get('id'))
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/admin/products')
  revalidatePath('/shop')
}
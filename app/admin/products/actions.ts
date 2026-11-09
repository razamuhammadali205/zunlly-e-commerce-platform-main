'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized. Please log in again.')

  // 2. Extract Form Data
  const name = String(formData.get('name') || '')
  const price = Number(formData.get('price'))
  const description = String(formData.get('description') || '')
  const category = String(formData.get('category') || 'Fragrance')
  const stock = Number(formData.get('stock') || 0)
  
  // Nayi details
  const brand = String(formData.get('brand') || '')
  const condition = String(formData.get('condition') || 'New')
  const fragrance_notes = String(formData.get('fragrance_notes') || '')
  const size_ml = String(formData.get('size_ml') || '')
  const warranty = String(formData.get('warranty') || '')
  const return_policy = String(formData.get('return_policy') || '')
  const featuresString = String(formData.get('features') || '')
  const featuresArray = featuresString.split('\n').filter(f => f.trim() !== '')

  // Image Extract
  const imageFile = formData.get('image') as File | null
  let image_url = ''

  // 3. Image Upload Logic
  if (imageFile && imageFile.size > 0) {
    // Check file size (5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Image is larger than 5MB. Please upload a smaller image.')
    }

    const fileExt = imageFile.name.split('.').pop()
    const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error("❌ IMAGE UPLOAD ERROR:", uploadError)
      throw new Error('Image upload failed: ' + uploadError.message)
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)
      
    image_url = publicUrl
  }

  // 4. Generate Slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') 
    + '-' + Math.random().toString(36).substring(2, 6);

  // 5. Insert into Database
  const { error } = await supabase.from('products').insert({
    name,
    slug, 
    price,
    description,
    category,
    stock,
    images: image_url ? [image_url] : [], 
    status: 'published',
    created_by: user.id, 
    brand,
    condition,
    fragrance_notes,
    size_ml,
    warranty,
    return_policy,
    features: featuresArray
  })

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
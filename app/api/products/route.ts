import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id,name,slug,description,price,compare_at_price,fragrance_notes,sizes,images,stock,categories(name,slug)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load products' }, { status: 500 })
  return NextResponse.json({ products: data ?? [] })
}

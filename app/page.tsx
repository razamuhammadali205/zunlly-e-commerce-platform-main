import { ZunllyHome } from '@/components/zunlly-home'
import { createClient } from '@/lib/supabase/server'
import { getProductImageUrl } from '@/lib/product-image'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id,name,price,images,fragrance_notes,categories(name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const products = (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    category: Array.isArray(product.categories) ? product.categories[0]?.name ?? 'Collection' : product.categories?.name ?? 'Collection',
    price: `PKR ${Number(product.price).toLocaleString('en-PK')}`,
    image: getProductImageUrl(product.images),
    notes: Array.isArray(product.fragrance_notes) ? product.fragrance_notes.join(' · ') : '',
    tag: '',
  }))

  return <ZunllyHome products={products} />
}

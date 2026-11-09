import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getProductImageUrl } from '@/lib/product-image'
import { Sparkles } from 'lucide-react'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  
  // Category aur Products fetch karo
  const { data: category } = await supabase
    .from('categories')
    .select('id,name')
    .eq('slug', slug)
    .maybeSingle()

  const { data: products } = category 
    ? await supabase
        .from('products')
        .select('id,name,price,images,fragrance_notes')
        .eq('category_id', category.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
    : { data: [] }

  const imageUrl = (images: unknown) => getProductImageUrl(images)

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292722]">
      
      {/* Top Header */}
      <section className="px-5 pt-12 pb-8 md:px-8 lg:px-12 max-w-7xl mx-auto border-b border-[#e6e1d9]">
        <Link href="/shop" className="text-xs uppercase tracking-[.18em] text-[#b49a62] hover:text-[#292722] transition-colors">
          ← Back to Shop
        </Link>
        
        <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3 text-[#b49a62]">
              <Sparkles size={18} />
              <span className="text-xs font-semibold uppercase tracking-[.2em]">Curated Collection</span>
            </div>
            <h1 className="font-serif text-6xl md:text-7xl capitalize">
              {category?.name || 'Collection'}
            </h1>
            <p className="mt-4 text-[#827b70] max-w-lg">
              Explore our exclusive range of fragrances curated specifically for this collection.
            </p>
          </div>
          <p className="text-sm font-medium tracking-widest uppercase text-[#9b9387]">
            {products?.length || 0} Fragrances
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-5 py-12 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {products && products.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Link href={`/shop/${product.id}`} key={product.id} className="group flex flex-col">
                
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#efede8] mb-4">
                  <Image 
                    src={imageUrl(product.images)} 
                    alt={product.name} 
                    fill 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" 
                    className="object-cover transition duration-700 group-hover:scale-105" 
                  />
                  
                  {/* Quick Add Hover Button */}
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <div className="w-full bg-white/90 backdrop-blur-sm py-3 text-center text-xs font-semibold uppercase tracking-[.12em] text-[#292722] hover:bg-[#1d1c1a] hover:text-white transition-colors">
                      View Details
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col flex-1">
                  <h2 className="font-serif text-xl leading-tight text-[#292722] group-hover:text-[#b49a62] transition-colors">
                    {product.name}
                  </h2>
                  
                  {/* Fragrance Notes */}
                  {product.fragrance_notes && (
                    <p className="mt-1 text-xs uppercase tracking-[.1em] text-[#9b9387] line-clamp-1">
                      {Array.isArray(product.fragrance_notes) ? product.fragrance_notes.join(' · ') : 'Signature Scent'}
                    </p>
                  )}
                  
                  {/* Price */}
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-medium">
                      PKR {Number(product.price).toLocaleString('en-PK')}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider text-[#b49a62] border border-[#b49a62]/30 px-2 py-0.5 rounded-sm bg-[#b49a62]/5">
                      Eau de Parfum
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center flex flex-col items-center border border-[#e6e1d9] bg-white">
            <h3 className="font-serif text-3xl mb-2">No fragrances found</h3>
            <p className="text-[#827b70] mb-8">This collection is being prepared. Check back soon.</p>
            <Link href="/shop" className="bg-[#1d1c1a] px-8 py-3 text-xs uppercase tracking-[.18em] text-white hover:bg-[#b49a62] transition-colors">
              Explore All Products
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
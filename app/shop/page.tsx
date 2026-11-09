import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getProductImageUrl } from '@/lib/product-image'
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react'

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { sort?: string; note?: string }
}) {
  const supabase = await createClient()
  
  // 1. Data Fetch (Existing logic)
  const { data: products } = await supabase
    .from('products')
    .select('id,name,price,images,fragrance_notes')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const imageUrl = (images: unknown) => getProductImageUrl(images)

  // 2. Filtering & Sorting Logic (Basic)
  let displayProducts = [...(products || [])]
  
  // Note filter (Agar URL mein ?note=Oud hai)
  if (searchParams.note) {
    displayProducts = displayProducts.filter(p => 
      Array.isArray(p.fragrance_notes) && 
      p.fragrance_notes.some((note: string) => note.toLowerCase().includes(searchParams.note!.toLowerCase()))
    )
  }

  // Sort filter
  if (searchParams.sort === 'price-asc') {
    displayProducts.sort((a, b) => Number(a.price) - Number(b.price))
  } else if (searchParams.sort === 'price-desc') {
    displayProducts.sort((a, b) => Number(b.price) - Number(a.price))
  }

  // Extract all unique notes for filters
  const allNotes = Array.from(
    new Set(products?.flatMap(p => p.fragrance_notes || []) as string[])
  ).slice(0, 6) // Top 6 notes show karenge

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292722]">
      
      {/* Top Header */}
      <section className="px-5 pt-12 pb-8 md:px-8 lg:px-12 max-w-7xl mx-auto border-b border-[#e6e1d9]">
        <Link href="/" className="text-xs uppercase tracking-[.18em] text-[#b49a62] hover:text-[#292722] transition-colors">
          ← Back to Home
        </Link>
        <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-6xl md:text-7xl">The Collection</h1>
            <p className="mt-4 text-[#827b70] max-w-lg">
              Discover your signature scent. Crafted with the finest ingredients, designed for the modern individual.
            </p>
          </div>
          <p className="text-sm font-medium tracking-widest uppercase text-[#9b9387]">
            {displayProducts.length} Fragrances
          </p>
        </div>
      </section>

      {/* Filter & Sort Bar */}
      <section className="px-5 py-6 md:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Notes Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <span className="text-xs uppercase tracking-wider text-[#9b9387] flex items-center gap-1 mr-2">
            <SlidersHorizontal size={14} /> Filter:
          </span>
          <Link href="/shop" className={`whitespace-nowrap px-4 py-2 text-xs uppercase tracking-wider border transition-colors ${!searchParams.note ? 'bg-[#1d1c1a] text-white border-[#1d1c1a]' : 'border-[#e6e1d9] text-[#827b70] hover:border-[#b49a62]'}`}>
            All
          </Link>
          {allNotes.map(note => (
            <Link 
              key={note} 
              href={`/shop?note=${note}`}
              className={`whitespace-nowrap px-4 py-2 text-xs uppercase tracking-wider border transition-colors ${searchParams.note === note ? 'bg-[#1d1c1a] text-white border-[#1d1c1a]' : 'border-[#e6e1d9] text-[#827b70] hover:border-[#b49a62]'}`}
            >
              {note}
            </Link>
          ))}
        </div>

        {/* Sort Dropdown (Using Links for simplicity in Server Component) */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs uppercase tracking-wider text-[#9b9387] flex items-center gap-1 mr-2">
            <ArrowUpDown size={14} /> Sort:
          </span>
          <Link href="/shop?sort=newest" className={`whitespace-nowrap px-4 py-2 text-xs uppercase tracking-wider border transition-colors ${!searchParams.sort || searchParams.sort === 'newest' ? 'bg-[#1d1c1a] text-white border-[#1d1c1a]' : 'border-[#e6e1d9] text-[#827b70] hover:border-[#b49a62]'}`}>
            Newest
          </Link>
          <Link href="/shop?sort=price-asc" className={`whitespace-nowrap px-4 py-2 text-xs uppercase tracking-wider border transition-colors ${searchParams.sort === 'price-asc' ? 'bg-[#1d1c1a] text-white border-[#1d1c1a]' : 'border-[#e6e1d9] text-[#827b70] hover:border-[#b49a62]'}`}>
            Price: Low to High
          </Link>
          <Link href="/shop?sort=price-desc" className={`whitespace-nowrap px-4 py-2 text-xs uppercase tracking-wider border transition-colors ${searchParams.sort === 'price-desc' ? 'bg-[#1d1c1a] text-white border-[#1d1c1a]' : 'border-[#e6e1d9] text-[#827b70] hover:border-[#b49a62]'}`}>
            Price: High to Low
          </Link>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-5 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {displayProducts.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayProducts.map((product) => (
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
                  <p className="mt-1 text-xs uppercase tracking-[.1em] text-[#9b9387] line-clamp-1">
                    {Array.isArray(product.fragrance_notes) ? product.fragrance_notes.join(' · ') : 'Signature Scent'}
                  </p>
                  
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
          <div className="py-32 text-center flex flex-col items-center">
            <h3 className="font-serif text-3xl mb-2">No fragrances found</h3>
            <p className="text-[#827b70] mb-8">Try adjusting your filters to find your perfect scent.</p>
            <Link href="/shop" className="bg-[#1d1c1a] px-8 py-3 text-xs uppercase tracking-[.18em] text-white hover:bg-[#b49a62] transition-colors">
              Clear Filters
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
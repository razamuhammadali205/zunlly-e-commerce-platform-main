import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getProductImageUrl } from '@/lib/product-image'
import AddToCartButton from '@/components/add-to-cart-button'
import { ProductReviews } from '@/components/product-reviews'
import { Star, ShieldCheck, Truck } from 'lucide-react'

// 👇 YAHAN WISHLIST BUTTONS IMPORT KIYE HAIN
import { InlineWishlistButton } from '@/components/inline-wishlist-button'
import { CardWishlistButton } from '@/components/card-wishlist-button'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Product
  const { data: product } = await supabase
    .from('products')
    .select('id,name,price,description,images,fragrance_notes,stock')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (!product) notFound()

  // 2. Fetch Reviews
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', product.id)

  // ✅ FIX: Safe Reviews Array
  const safeReviews = reviews || []
  const reviewCount = safeReviews.length
  const avgRating = reviewCount > 0 
    ? (safeReviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1)
    : 0

  const primaryImage = getProductImageUrl(product.images)

  // 👇 CHECK KAR RAHE HAIN KE USER NE PEHLE SE WISHLIST MEIN SAVE KIYA HAI YA NHI
  const { data: { user } } = await supabase.auth.getUser()
  let isSaved = false
  if (user) {
    const { data: saved } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle()
    if (saved) isSaved = true
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292722] pb-24">
      <div className="mx-auto max-w-6xl px-5 py-12">
        
        {/* Back Link */}
        <Link href="/shop" className="text-xs font-semibold uppercase tracking-[.18em] text-[#b49a62] hover:text-[#292722] transition-colors">
          ← Back to collection
        </Link>

        {/* Product Details Grid */}
        <div className="mt-8 grid gap-10 md:grid-cols-2 lg:gap-16">
          
          {/* Left: Image */}
          <div className="relative aspect-[4/5] bg-[#efede8] overflow-hidden group">
            <Image 
              src={primaryImage} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw" 
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
              priority
            />
            {/* 👇 IMAGE KE UPAR HEART BUTTON (Top Right) */}
            <div className="absolute top-4 right-4 z-10">
              <CardWishlistButton productId={product.id} initialIsSaved={isSaved} />
            </div>
          </div>

          {/* Right: Info */}
          <div className="py-2 lg:py-8 flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b49a62]">ZUNLLY Fragrance</p>
            
            <h1 className="mt-3 font-serif text-4xl md:text-5xl lg:text-6xl leading-tight">{product.name}</h1>
            
            {/* Rating Display */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex text-[#b49a62]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} fill={star <= Number(avgRating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-sm text-[#827b70]">({reviewCount} reviews)</span>
            </div>

            <p className="mt-6 text-2xl font-medium">PKR {Number(product.price).toLocaleString('en-PK')}</p>
            
            <p className="mt-6 leading-relaxed text-[#827b70]">{product.description}</p>
            
            {/* Notes */}
            <div className="mt-6 flex flex-wrap gap-2">
              {Array.isArray(product.fragrance_notes) && product.fragrance_notes.map((note: string) => (
                <span key={note} className="border border-[#e6e1d9] bg-white px-3 py-1 text-xs uppercase tracking-wider text-[#827b70]">
                  {note}
                </span>
              ))}
            </div>

            {/* Add to Cart & Wishlist Button Area */}
            <div className="mt-10 border-t border-[#e6e1d9] pt-8">
              <div className="flex gap-3 items-stretch">
                {/* Add To Cart Button */}
                <div className="flex-1">
                  <AddToCartButton 
                    product={{ 
                      id: product.id, 
                      name: product.name, 
                      price: Number(product.price), 
                      image: Array.isArray(product.images) ? product.images[0] || '' : '' 
                    }} 
                  />
                </div>
                {/* 👇 ADD TO CART KE SAATH WISHLIST BUTTON */}
                <div className="shrink-0">
                   <InlineWishlistButton productId={product.id} initialIsSaved={isSaved} />
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-[#827b70]">
                <Truck size={18} className="text-[#b49a62]" />
                <span>Free delivery on orders over PKR 10,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#827b70]">
                <ShieldCheck size={18} className="text-[#b49a62]" />
                <span>30 days easy return & exchange policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-20">
          <ProductReviews productId={product.id} />
        </div>

      </div>
    </main>
  )
}
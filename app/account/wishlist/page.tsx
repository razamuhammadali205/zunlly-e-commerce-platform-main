import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProductImageUrl } from '@/lib/product-image' // ✅ Image helper import kiya
import { CardWishlistButton } from '@/components/card-wishlist-button' // ✅ Remove button ke liye

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 1. Fetch wishlist items
  const { data: wishlistItems } = await supabase
    .from('wishlist')
    .select('id, product_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 2. Fetch products (Agar wishlist khali nahi hai)
  let products: any[] = []
  if (wishlistItems && wishlistItems.length > 0) {
    const productIds = wishlistItems.map(item => item.product_id)
    
    const { data: productData } = await supabase
      .from('products')
      .select('id, name, price, images, slug')
      .in('id', productIds)
      
    if (productData) {
      products = productData
    }
  }

  // 3. Combine them
  const combinedItems = wishlistItems?.map(wish => {
    const product = products.find(p => p.id === wish.product_id)
    return { ...wish, product }
  }).filter(item => item.product) || []

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/account" className="text-sm font-semibold text-[#c46c3b] hover:text-[#a55626]">
          ← Account overview
        </Link>
        
        <h1 className="mt-8 font-serif text-5xl text-[#3b281c]">My Wishlist</h1>
        <p className="mt-2 text-sm text-[#8a6b58]">Items you have saved for later.</p>

        <div className="mt-8">
          {combinedItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#dbc8b5] bg-white/60 p-12 text-center">
              <p className="font-serif text-2xl text-[#3b281c]">Your wishlist is empty</p>
              <p className="mt-2 text-sm text-[#8a6b58]">Tap the heart icon on any product to save it here.</p>
              <Link href="/shop" className="mt-6 inline-block rounded-full bg-[#c46c3b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#a55626]">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {combinedItems.map((item) => (
                <div key={item.id} className="group rounded-3xl bg-white p-4 shadow-sm transition-all hover:shadow-md relative">
                  
                  {/* Heart Button to Remove from Wishlist */}
                  <div className="absolute right-6 top-6 z-10">
                    <CardWishlistButton productId={item.product.id} initialIsSaved={true} />
                  </div>

                  <Link href={`/shop/${item.product.slug || item.product.id}`} className="block aspect-square overflow-hidden rounded-2xl bg-[#fbf7f1]">
                    <img 
                      src={getProductImageUrl(item.product.images)} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                    />
                  </Link>
                  <div className="mt-4">
                    <h3 className="font-semibold text-[#3b281c] line-clamp-1">{item.product.name}</h3>
                    <p className="mt-1 font-semibold text-[#c46c3b]">PKR {Number(item.product.price).toLocaleString('en-PK')}</p>
                    
                    <div className="mt-4 flex gap-2">
                      <Link 
                        href={`/shop/${item.product.slug || item.product.id}`}
                        className="flex-1 rounded-xl bg-[#3b281c] px-4 py-2 text-center text-xs font-semibold text-white hover:bg-[#c46c3b]"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
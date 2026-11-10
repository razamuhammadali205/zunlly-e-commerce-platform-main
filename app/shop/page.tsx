'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProductImageUrl } from '@/lib/product-image'
import { SlidersHorizontal, X, Search, ShoppingBag, UserRound, Star, Menu, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useCart } from '@/components/cart-provider'

type Product = {
  id: string
  name: string
  price: number
  images: any
  fragrance_notes: string[] | null
  category_id: string | null
  product_reviews?: { rating: number }[]
}

// ✅ 1. ANIMATIONS SETUP (Amazon style smooth load)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

export default function ShopPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { count: cartCount } = useCart()
  
  const currentCategory = searchParams.get('category')
  const currentNote = searchParams.get('note')
  const currentSort = searchParams.get('sort') || 'newest'
  const currentMin = searchParams.get('min') || ''
  const currentMax = searchParams.get('max') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState({ min: currentMin, max: currentMax })

  useEffect(() => {
    const supabase = createClient()

    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)

      const { data } = await supabase
        .from('products')
        .select(`
          id, name, price, images, fragrance_notes, category_id,
          product_reviews ( rating )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      
      if (data) setProducts(data as Product[])
      setLoading(false)
    }
    
    fetchData()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const allNotes = useMemo(() => {
    const notes = products.flatMap(p => p.fragrance_notes || [])
    return Array.from(new Set(notes))
  }, [products])

  const displayProducts = useMemo(() => {
    let result = [...products]
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (currentCategory) result = result.filter(p => p.category_id === currentCategory)
    if (currentNote) {
      result = result.filter(p => Array.isArray(p.fragrance_notes) && p.fragrance_notes.some(n => n.toLowerCase().includes(currentNote.toLowerCase())))
    }
    if (currentMin) result = result.filter(p => Number(p.price) >= Number(currentMin))
    if (currentMax) result = result.filter(p => Number(p.price) <= Number(currentMax))

    if (currentSort === 'price-asc') result.sort((a, b) => Number(a.price) - Number(b.price))
    else if (currentSort === 'price-desc') result.sort((a, b) => Number(b.price) - Number(a.price))

    return result
  }, [products, currentCategory, currentNote, currentSort, currentMin, currentMax, searchQuery])

  const imageUrl = (images: unknown) => getProductImageUrl(images)

  const applyFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/shop?${params.toString()}`)
  }

  const applyPriceRange = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (priceRange.min) params.set('min', priceRange.min)
    else params.delete('min')
    if (priceRange.max) params.set('max', priceRange.max)
    else params.delete('max')
    router.push(`/shop?${params.toString()}`)
    setIsFilterOpen(false)
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'

  return (
    <div className="min-h-screen bg-white text-[#0F1111] font-sans selection:bg-[#b49a62] selection:text-white">
      
      {/* ✅ 2. HEADER (Amazon Clean Style) */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex h-[80px] max-w-[1440px] items-center justify-between px-5 lg:px-12 relative">
          
          <div className="flex items-center gap-10 flex-1">
            <button className="lg:hidden p-2 -ml-2 hover:text-[#b49a62]">
              <Menu size={24} />
            </button>

            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.png" alt="ZUNLLY Logo" width={110} height={40} className="object-contain" />
            </Link>
            
            <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-gray-800">
              <Link href="/shop" className="text-[#b49a62] font-bold">Shop All</Link>
              <Link href="/category/for-him" className="hover:text-[#b49a62] transition-colors">For Him</Link>
              <Link href="/category/for-her" className="hover:text-[#b49a62] transition-colors">For Her</Link>
              <Link href="/category/unisex" className="hover:text-[#b49a62] transition-colors">Unisex</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
            <div className="hidden xl:flex items-center border-2 border-gray-300 rounded-md focus-within:border-[#b49a62] transition-colors overflow-hidden">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 bg-transparent text-[13px] outline-none w-48 placeholder:text-gray-500"
              />
              <button className="bg-gray-100 p-2 hover:bg-gray-200 transition-colors">
                <Search size={16} className="text-gray-600" />
              </button>
            </div>

            {user ? (
              <Link href="/account" className="flex items-center gap-2 hover:text-[#b49a62] transition-colors p-1">
                <UserRound size={22} />
                <span className="hidden sm:block text-[13px] font-medium">{userName}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block text-[13px] font-medium hover:text-[#b49a62]">Login</Link>
                <Link href="/signup" className="hidden sm:block text-[13px] font-medium hover:text-[#b49a62]">Signup</Link>
                <Link href="/login" className="sm:hidden hover:text-[#b49a62] p-1"><UserRound size={22} /></Link>
              </div>
            )}
            
            <Link href="/cart" className="relative hover:text-[#b49a62] transition-colors p-1 flex items-center gap-1">
              <ShoppingBag size={24} />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#b49a62] text-[10px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. TITLE SECTION */}
      <section className="px-5 py-12 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full border-b border-gray-200">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">All Fragrances</h1>
          <p className="mt-2 text-sm text-gray-500">
            {displayProducts.length} Results found
          </p>
        </motion.div>
      </section>

      {/* 4. TOOLBAR */}
      <div className="sticky top-[80px] z-30 bg-white border-b border-gray-200">
        <div className="px-5 md:px-8 lg:px-12 max-w-[1440px] mx-auto h-14 flex items-center justify-between">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 text-[13px] font-bold text-gray-800 hover:text-[#b49a62]"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-gray-500">Sort by:</span>
            <select 
              value={currentSort}
              onChange={(e) => applyFilters('sort', e.target.value)}
              className="text-[13px] font-bold bg-transparent outline-none cursor-pointer hover:text-[#b49a62]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. FILTER SIDEBAR */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <span className="text-lg font-bold">Filters</span>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h3 className="text-[13px] font-bold mb-4 text-gray-900">Category</h3>
                  <div className="flex flex-col gap-3">
                    {['All', 'For Him', 'For Her', 'Unisex'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { applyFilters('category', cat === 'All' ? null : cat); setIsFilterOpen(false); }}
                        className={`text-left text-[14px] py-1 ${(!currentCategory && cat === 'All') || currentCategory === cat ? 'font-bold text-[#b49a62]' : 'text-gray-600'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[13px] font-bold mb-4 text-gray-900">Price Range (PKR)</h3>
                  <div className="flex items-center gap-4">
                    <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: e.target.value})} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black rounded" />
                    <span className="text-gray-400">-</span>
                    <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: e.target.value})} className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-black rounded" />
                  </div>
                  <button onClick={applyPriceRange} className="mt-3 w-full bg-[#1d1c1a] text-white py-2 text-[13px] font-bold rounded hover:bg-[#b49a62] transition-colors">
                    Apply Price
                  </button>
                </div>

                <div>
                  <h3 className="text-[13px] font-bold mb-4 text-gray-900">Fragrance Notes</h3>
                  <div className="flex flex-wrap gap-2">
                    {allNotes.map((note) => (
                      <button
                        key={note}
                        onClick={() => { applyFilters('note', note); setIsFilterOpen(false); }}
                        className={`px-3 py-1.5 text-[12px] border rounded-full ${currentNote === note ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-black'}`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button 
                  onClick={() => { router.push('/shop'); setIsFilterOpen(false); setPriceRange({min: '', max: ''}); setSearchQuery(''); }} 
                  className="w-full border border-black py-3 text-[13px] font-bold rounded hover:bg-black hover:text-white transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. PRODUCT GRID (Stagger Animation) */}
      <section className="flex-1 px-5 py-10 md:px-8 lg:px-12 max-w-[1440px] mx-auto w-full">
        {loading ? (
          <div className="py-32 text-center text-sm text-gray-500">Loading products...</div>
        ) : displayProducts.length > 0 ? (
          <motion.div 
            variants={containerVariants} initial="hidden" animate="visible"
            className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {displayProducts.map((product) => {
              const reviews = product.product_reviews || []
              const reviewCount = reviews.length
              const avgRating = reviewCount > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1) : 0

              return (
                <motion.div key={product.id} variants={itemVariants}>
                  <Link href={`/shop/${product.id}`} className="group flex flex-col border border-gray-100 bg-white p-4 hover:shadow-xl transition-all duration-300 rounded-lg">
                    <div className="relative aspect-square w-full overflow-hidden bg-[#f4f4f4] mb-4 rounded-md">
                      <Image 
                        src={imageUrl(product.images)} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" 
                        className="object-cover transition duration-500 group-hover:scale-110" 
                      />
                    </div>

                    <div className="flex flex-col flex-1">
                      <h2 className="text-[15px] font-semibold text-gray-900 line-clamp-1 group-hover:text-[#b49a62] transition-colors">
                        {product.name}
                      </h2>
                      
                      {/* Rating (Amazon Style) */}
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex text-[#FFA41C]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={12} fill={star <= Number(avgRating) ? 'currentColor' : 'none'} strokeWidth={1.5} />
                          ))}
                        </div>
                        <span className="text-[11px] text-[#007185] hover:underline cursor-pointer">({reviewCount})</span>
                      </div>

                      <p className="mt-1 text-[11px] text-gray-500 line-clamp-1">
                        {Array.isArray(product.fragrance_notes) ? product.fragrance_notes.join(' · ') : 'Signature Scent'}
                      </p>
                      
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-[18px] font-bold text-gray-900">
                          PKR {Number(product.price).toLocaleString('en-PK')}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <div className="py-32 text-center flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-2">No products found</h3>
            <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search.</p>
            <button onClick={() => { router.push('/shop'); setSearchQuery(''); }} className="border border-black px-8 py-3 text-[13px] font-bold hover:bg-black hover:text-white transition-colors rounded">
              Clear All
            </button>
          </div>
        )}
      </section>

      {/* 7. FOOTER (Amazon Style Links) */}
      <footer className="bg-[#37475A] text-white mt-20">
        <div className="bg-[#232F3E] py-4 text-center cursor-pointer hover:bg-[#485769] transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="text-[13px] font-medium">Back to top</span>
        </div>
        
        <div className="max-w-[1440px] mx-auto grid gap-8 md:grid-cols-4 py-12 px-5 md:px-8 lg:px-12">
          <div>
            <h4 className="text-[16px] font-bold mb-4 text-white">Get to Know Us</h4>
            <ul className="space-y-2 text-[14px] text-gray-300">
              <li><Link href="/about" className="hover:underline">About ZUNLLY</Link></li>
              <li><Link href="/contact" className="hover:underline">Careers</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[16px] font-bold mb-4 text-white">Shop With Us</h4>
            <ul className="space-y-2 text-[14px] text-gray-300">
              <li><Link href="/shop" className="hover:underline">All Fragrances</Link></li>
              <li><Link href="/category/for-him" className="hover:underline">For Him</Link></li>
              <li><Link href="/category/for-her" className="hover:underline">For Her</Link></li>
              <li><Link href="/category/unisex" className="hover:underline">Unisex</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[16px] font-bold mb-4 text-white">Let Us Help You</h4>
            <ul className="space-y-2 text-[14px] text-gray-300">
              <li><Link href="/account" className="hover:underline">Your Account</Link></li>
              <li><Link href="/shipping" className="hover:underline">Shipping Rates & Policies</Link></li>
              <li><Link href="/shipping" className="hover:underline">Returns & Replacements</Link></li>
              <li><Link href="/privacy" className="hover:underline">Help</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[16px] font-bold mb-4 text-white">Connect</h4>
            <ul className="space-y-2 text-[14px] text-gray-300">
              <li><a href="#" className="hover:underline">Instagram</a></li>
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">Twitter</a></li>
            </ul>
          </div>
        </div>

        <div className="bg-[#131A22] py-6 text-center border-t border-gray-700">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="ZUNLLY Logo" width={100} height={35} className="object-contain brightness-0 invert opacity-80" />
          </Link>
          <p className="text-[12px] text-gray-400">© 2026 ZUNLLY. All rights reserved. Designed & Crafted in Pakistan.</p>
        </div>
      </footer>
    </div>
  )
}
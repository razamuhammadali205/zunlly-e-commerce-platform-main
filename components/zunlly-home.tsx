'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Check, Heart, Menu, Search, ShoppingBag, Sparkles, UserRound, X, Star, Flame } from 'lucide-react'
import { useCart } from '@/components/cart-provider'
import { createClient } from '@/lib/supabase/client' 
import { CardWishlistButton } from '@/components/card-wishlist-button'
import { useRouter } from 'next/navigation'

type StoreProduct = { 
  id: string; name: string; category: string; price: string | number; 
  image: string; notes: string; tag: string;
  product_reviews?: { rating: number }[]; 
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

function ProductCard({ product, onAdd, onBuyNow }: { product: StoreProduct; onAdd: () => void; onBuyNow: () => void }) {
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    onAdd()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const reviews = product.product_reviews || []
  const reviewCount = reviews.length
  const avgRating = reviewCount > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1) : 0

  return (
    <motion.article variants={fadeUp} className="group flex flex-col relative bg-white p-3 shadow-sm rounded-lg border border-gray-100 transition-all hover:shadow-md">
      
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[#f4f2ee] rounded-md mb-3">
          <Image 
            src={product.image || '/placeholder.jpg'} alt={product.name} fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
          />
          {product.tag && (
            <span className="absolute left-2 top-2 bg-white/95 px-2 py-1 text-[9px] font-semibold uppercase tracking-[.2em] text-[#292722] rounded shadow-sm">
              {product.tag}
            </span>
          )}
          <div className="absolute right-2 top-2 z-10">
            <CardWishlistButton productId={product.id} />
          </div>
        </div>
      </Link>

      <Link href={`/shop/${product.id}`} className="flex flex-col mt-1 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#b49a62] mb-1">{product.category || 'FRAGRANCE'}</p>
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-serif text-[16px] leading-tight text-[#292722] group-hover:text-[#b49a62] transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[13px] font-bold text-[#292722] whitespace-nowrap pt-0.5">
            {String(product.price).includes('PKR') ? product.price : `PKR ${Number(product.price).toLocaleString('en-PK')}`}
          </p>
        </div>
        <p className="mt-1 text-[11px] text-[#827b70] line-clamp-1 mb-2">{product.notes || 'Signature Scent'}</p>
        
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex text-[#b49a62]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={11} fill={star <= Number(avgRating) ? 'currentColor' : 'none'} strokeWidth={1.5} className="mr-[1px]" />
            ))}
          </div>
          <span className="text-[10px] text-[#827b70] font-medium">({reviewCount})</span>
        </div>
      </Link>

      <div className="mt-auto flex gap-2">
        <button onClick={handleAdd} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-white transition-colors rounded ${added ? 'bg-green-600' : 'bg-[#1d1c1a] hover:bg-[#b49a62]'}`}>
          {added ? '✓ Added' : 'Add to Cart'}
        </button>
        <button onClick={(e) => { e.preventDefault(); onBuyNow(); }} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#1d1c1a] bg-white border border-[#1d1c1a] hover:bg-[#1d1c1a] hover:text-white transition-colors rounded">
          Buy Now
        </button>
      </div>
    </motion.article>
  )
}

export function ZunllyHome({ 
  products, 
  heroImage = 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=2000&q=90' 
}: { products: StoreProduct[]; heroImage?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()
  const router = useRouter() 
  const { count: cartCount, add: addCartItem } = useCart()
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const filtered = useMemo(() => products.filter((p) => `${p.name} ${p.category} ${p.notes}`.toLowerCase().includes(query.toLowerCase())), [products, query])
  
  const addToCart = async (product: StoreProduct) => {
    await addCartItem({ id: product.id, name: product.name, price: Number(String(product.price).replace(/[^0-9.]/g, '')) || 0, image: product.image })
  }

  const buyNow = (product: StoreProduct) => {
    router.push(`/checkout?buy_now=${product.id}&qty=1`)
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'

  // ✅ SMART LOGIC: 
  // Hot Selling = Pehle 4 products
  // Best Sellers = Agle 4 products (ya agar kam hain toh baqi bache hue)
  const hotSellingProducts = products.slice(0, 4)
  const bestSellingProducts = products.length > 4 ? products.slice(4, 8) : products.slice(4)

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#292722] font-sans selection:bg-[#b49a62] selection:text-white">
      
      <div className="bg-[#1d1c1a] py-2.5 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee text-[9px] font-semibold uppercase tracking-[.25em] text-[#d8c49a]">
          <span className="mx-6">Complimentary delivery across Pakistan on orders over PKR 10,000</span>
          <span className="mx-4">✦</span>
          <span className="mx-6">Quality meets value. Discover your signature scent.</span>
          <span className="mx-4">✦</span>
          <span className="mx-6">Complimentary delivery across Pakistan on orders over PKR 10,000</span>
          <span className="mx-4">✦</span>
          <span className="mx-6">Quality meets value. Discover your signature scent.</span>
          <span className="mx-4">✦</span>
        </div>
      </div>

      {/* HEADER */}
      <header className={`sticky top-0 z-40 bg-white transition-all duration-300 border-b border-gray-100 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="mx-auto flex h-[84px] max-w-[1440px] items-center justify-between px-5 lg:px-12 relative">
          <div className="flex items-center gap-8 flex-1">
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 -ml-2 hover:text-[#b49a62]">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.png" alt="ZUNLLY Logo" width={110} height={40} className="object-contain" />
            </Link>
            <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[.15em] text-gray-900">
              <Link href="/shop" className="hover:text-[#b49a62] transition-colors relative group">Shop All<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#b49a62] transition-all duration-300 group-hover:w-full"></span></Link>
              <Link href="/category/for-him" className="hover:text-[#b49a62] transition-colors relative group">For Him<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#b49a62] transition-all duration-300 group-hover:w-full"></span></Link>
              <Link href="/category/for-her" className="hover:text-[#b49a62] transition-colors relative group">For Her<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#b49a62] transition-all duration-300 group-hover:w-full"></span></Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6 flex-1 justify-end">
            <div className="hidden xl:flex items-center border-b border-gray-300 pb-1 w-48 focus-within:border-[#b49a62] transition-colors">
              <Search size={16} className="text-gray-500" />
              <input type="text" placeholder="Search..." onClick={() => setSearchOpen(true)} readOnly className="ml-2 bg-transparent text-[12px] outline-none w-full cursor-pointer placeholder:text-gray-500" />
            </div>
            <button onClick={() => setSearchOpen(true)} className="xl:hidden hover:text-[#b49a62] p-1"><Search size={22} strokeWidth={1.5} /></button>
            
            {user ? (
              <Link href="/account" className="flex items-center gap-2 hover:text-[#b49a62] p-1">
                <div className="h-7 w-7 rounded-full bg-[#efece6] flex items-center justify-center text-[#b49a62] border border-[#e6e1d9]"><UserRound size={14} /></div>
                <span className="hidden sm:block text-[11px] font-bold uppercase tracking-wider">{userName}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:text-[#b49a62]">Login</Link>
                <span className="hidden sm:block text-gray-300">|</span>
                <Link href="/signup" className="hidden sm:block text-[11px] font-bold uppercase tracking-wider text-gray-900 hover:text-[#b49a62]">Signup</Link>
                <Link href="/login" className="sm:hidden hover:text-[#b49a62] p-1"><UserRound size={22} strokeWidth={1.5} /></Link>
              </div>
            )}
            
            <Link href="/cart" className="relative hover:text-[#b49a62] p-1">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && <span className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#b49a62] text-[9px] font-bold text-white shadow-sm">{cartCount}</span>}
            </Link>
          </div>
        </div>
        {menuOpen && (
          <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="lg:hidden border-t border-gray-100 bg-white px-6 py-6 overflow-hidden">
            <div className="flex flex-col gap-6 text-[12px] font-bold uppercase tracking-[.15em] text-gray-900">
              <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop All</Link>
              <Link href="/category/for-him" onClick={() => setMenuOpen(false)}>For Him</Link>
              <Link href="/category/for-her" onClick={() => setMenuOpen(false)}>For Her</Link>
              <Link href="/about" onClick={() => setMenuOpen(false)}>Our Story</Link>
            </div>
          </motion.nav>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white/98 p-6 backdrop-blur-xl sm:p-12">
          <button onClick={() => setSearchOpen(false)} className="absolute right-6 top-6 hover:text-[#b49a62]"><X size={28} /></button>
          <div className="mx-auto mt-32 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#b49a62]">Search the collection</p>
            <div className="mt-6 flex items-center border-b-2 border-[#292722] pb-4">
              <Search size={24} strokeWidth={1.5} />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or notes..." className="ml-4 flex-1 bg-transparent font-serif text-3xl outline-none placeholder:text-gray-300 text-gray-900" />
            </div>
            <div className="mt-8 grid gap-2">
              {query && filtered.slice(0, 4).map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} onClick={() => setSearchOpen(false)} className="flex items-center justify-between border-b border-gray-100 py-4 hover:text-[#b49a62] group">
                  <span className="font-serif text-xl">{product.name}</span>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-[#b49a62]" />
                </Link>
              ))}
              {query && !filtered.length && <p className="text-sm text-gray-500 mt-4">No results found for "{query}"</p>}
            </div>
          </div>
        </div>
      )}

      <main>
        {/* HERO SECTION */}
        <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-[#1d1c1a]">
          <motion.div initial={{ scale: 1.05, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute inset-0">
            <Image src={heroImage} alt="ZUNLLY luxury fragrance" fill priority className="object-cover object-center" />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
          <div className="relative mx-auto flex h-full max-w-[1440px] items-center px-6 lg:px-16">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-xl text-white">
              <motion.p variants={fadeUp} className="mb-4 text-[10px] font-semibold uppercase tracking-[.35em] text-[#d8c49a]">The Signature Collection</motion.p>
              <motion.h1 variants={fadeUp} className="font-serif text-6xl leading-[1.05] sm:text-7xl md:text-[5.5rem]">Scent is<br /><em className="font-light text-white/90">memory.</em></motion.h1>
              <motion.p variants={fadeUp} className="mt-8 max-w-sm text-sm leading-relaxed text-white/80">Considered fragrances that linger beyond the moment. Composed with intention, worn with confidence.</motion.p>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <Link href="/shop" className="bg-white px-8 py-4 text-[10px] font-bold uppercase tracking-[.15em] text-[#292722] transition-transform hover:scale-105 hover:bg-[#d8c49a]">Shop Collection</Link>
                <Link href="/about" className="border border-white/40 px-8 py-4 text-[10px] font-bold uppercase tracking-[.15em] text-white transition-all hover:bg-white hover:text-[#292722]">Our Story</Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-12 lg:py-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
            <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#b49a62]">Discover</p>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Find your signature.</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid gap-6 md:grid-cols-3">
            {[
              ['For Him', '/category/for-him', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85'],
              ['For Her', '/category/for-her', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85'],
              ['Unisex', '/category/unisex', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85']
            ].map(([name, href, image]) => (
              <motion.div key={name} variants={fadeUp}>
                <Link href={href} className="group relative block h-[450px] overflow-hidden bg-[#ded7cd]">
                  <Image src={image} alt={name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-10 left-10 text-white">
                    <h3 className="font-serif text-3xl">{name}</h3>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white/80 group-hover:text-[#d8c49a] transition-colors flex items-center gap-2">Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ✅ HOT SELLING SECTION (Moved Up & Shows First 4 Products) */}
        {hotSellingProducts.length > 0 && (
          <section className="border-t border-[#ded8cc] bg-[#f8f6f0] px-5 py-24 lg:px-12">
            <div className="mx-auto max-w-[1440px]">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end mb-12">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#b49a62] flex items-center gap-2">
                    <Flame size={14} className="text-red-500" /> Trending Now
                  </p>
                  <h2 className="mt-4 font-serif text-4xl sm:text-5xl">Hot Selling.</h2>
                </div>
                <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[.15em] border-b-2 border-[#292722] pb-1 hover:text-[#b49a62] hover:border-[#b49a62] transition-colors flex items-center gap-2">View All <ArrowRight size={14} /></Link>
              </motion.div>
              
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {hotSellingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} onBuyNow={() => buyNow(product)} />
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ✅ BEST SELLERS SECTION (Now Shows Next 4 Products to avoid duplicates) */}
        {bestSellingProducts.length > 0 && (
          <section className="border-t border-[#ded8cc] bg-white px-5 py-24 lg:px-12">
            <div className="mx-auto max-w-[1440px]">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end mb-12">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#b49a62]">Best Sellers</p>
                  <h2 className="mt-4 font-serif text-4xl sm:text-5xl">The iconic scents.</h2>
                </div>
                <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[.15em] border-b-2 border-[#292722] pb-1 hover:text-[#b49a62] hover:border-[#b49a62] transition-colors flex items-center gap-2">View All <ArrowRight size={14} /></Link>
              </motion.div>
              
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {bestSellingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} onBuyNow={() => buyNow(product)} />
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* BRAND STORY SECTION */}
        <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-12 lg:py-32 overflow-hidden">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
              <div className="relative aspect-[4/5] w-full">
                <Image src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85" alt="ZUNLLY Craftsmanship" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-4 border border-[#cdbb91] bg-white px-8 py-6 sm:-right-6">
                <p className="font-serif text-4xl text-[#b49a62]">01</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[.2em] text-[#827b70]">Crafted with care</p>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-lg">
              <motion.div variants={fadeUp}>
                <Sparkles size={24} className="text-[#b49a62]" />
                <p className="mt-6 text-[10px] font-bold uppercase tracking-[.25em] text-[#b49a62]">The ZUNLLY Standard</p>
                <h2 className="mt-4 font-serif text-4xl sm:text-5xl leading-tight">The art of<br /><em className="font-light">staying memorable.</em></h2>
              </motion.div>
              <motion.p variants={fadeUp} className="mt-6 text-sm leading-relaxed text-[#827b70]">We believe luxury should be felt, not flaunted. Every ZUNLLY fragrance is composed with exceptional ingredients and an eye for balance — creating scents that feel personal, expressive, and entirely your own.</motion.p>
              <motion.ul variants={fadeUp} className="mt-8 space-y-4 text-[11px] font-bold uppercase tracking-[.1em] text-[#292722]">
                <li className="flex items-center gap-3"><Check size={16} className="text-[#b49a62]" /> Long-lasting compositions</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#b49a62]" /> Thoughtfully sourced ingredients</li>
                <li className="flex items-center gap-3"><Check size={16} className="text-[#b49a62]" /> Designed in Pakistan</li>
              </motion.ul>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ✅ AMAZON STYLE FOOTER (Logo without white box) */}
      <footer className="bg-[#232F3E] text-white">
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-[#37475A] hover:bg-[#485769] py-4 text-center cursor-pointer transition-colors"
        >
          <span className="text-[13px] font-medium">Back to top</span>
        </div>

        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 py-12 px-5">
          <div>
            <h4 className="font-bold text-white mb-3 text-[15px]">Get to Know Us</h4>
            <ul className="space-y-2 text-[13px] text-gray-300">
              <li><Link href="/about" className="hover:underline">Our Story</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 text-[15px]">Shop With Us</h4>
            <ul className="space-y-2 text-[13px] text-gray-300">
              <li><Link href="/shop" className="hover:underline">All Fragrances</Link></li>
              <li><Link href="/category/for-him" className="hover:underline">For Him</Link></li>
              <li><Link href="/category/for-her" className="hover:underline">For Her</Link></li>
              <li><Link href="/category/unisex" className="hover:underline">Unisex</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 text-[15px]">Let Us Help You</h4>
            <ul className="space-y-2 text-[13px] text-gray-300">
              <li><Link href="/account" className="hover:underline">Your Account</Link></li>
              <li><Link href="/shipping" className="hover:underline">Shipping Rates & Policies</Link></li>
              <li><Link href="/shipping" className="hover:underline">Returns & Replacements</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 text-[15px]">Let's Connect</h4>
            <ul className="space-y-2 text-[13px] text-gray-300">
              <li><a href="#" className="hover:underline">Instagram</a></li>
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">Twitter</a></li>
            </ul>
          </div>
        </div>

        <div className="bg-[#131A22] py-8 text-center border-t border-gray-700 flex flex-col items-center justify-center">
          <Link href="/" className="mb-4 inline-block">
            <Image src="/logo.png" alt="ZUNLLY Logo" width={100} height={35} className="object-contain brightness-0 invert opacity-90" />
          </Link>
          <p className="text-[12px] text-gray-400">© 2026 ZUNLLY. All rights reserved. Designed & Crafted in Pakistan.</p>
        </div>
      </footer>
    </div>
  )
}
import Link from 'next/link'
import Image from 'next/image'
import { Droplets, Sparkles, Truck } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292722]">
      
      {/* 1. Header / Hero Section */}
      <section className="relative px-5 pt-12 pb-24 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <Link href="/" className="text-xs uppercase tracking-[.18em] text-[#b49a62] hover:text-[#292722] transition-colors">
          ← Back to ZUNLLY
        </Link>
        
        <div className="mt-16 grid gap-12 lg:grid-cols-2 items-center">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b49a62]">Our Story</p>
            <h1 className="mt-4 font-serif text-6xl md:text-7xl leading-[1.1]">
              The Art of <br /> 
              <span className="italic text-[#827b70]">Invisible Luxury.</span>
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-[#827b70]">
              ZUNLLY believes quality fragrance should feel personal and attainable. Our considered compositions are designed in Pakistan and made to become part of your everyday ritual.
            </p>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#efece6]">
            {/* Yahan koi bhi aesthetic image laga sakte ho */}
            <Image 
              src="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop" 
              alt="Zunlly Fragrance Crafting" 
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. Brand Pillars / Values */}
      <section className="bg-[#1d1c1a] text-white py-24 px-5 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-4xl">Why ZUNLLY?</h2>
            <p className="mt-4 text-[#9b9387]">We don't just sell perfumes. We craft memories, elevate moods, and define your unique presence.</p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-3 text-center">
            {/* Value 1 */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#292722] border border-[#3f3b36] mb-6 text-[#b49a62]">
                <Sparkles size={24} />
              </div>
              <h3 className="font-serif text-xl mb-3">Premium Ingredients</h3>
              <p className="text-sm text-[#9b9387] leading-relaxed">Sourced globally, blended perfectly. Our fragrances are crafted with the finest essential oils for long-lasting sillage.</p>
            </div>
            
            {/* Value 2 */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#292722] border border-[#3f3b36] mb-6 text-[#b49a62]">
                <Droplets size={24} />
              </div>
              <h3 className="font-serif text-xl mb-3">Attainable Luxury</h3>
              <p className="text-sm text-[#9b9387] leading-relaxed">We believe you shouldn't have to break the bank for a signature scent. We bridge the gap between high-end quality and fair pricing.</p>
            </div>

            {/* Value 3 */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#292722] border border-[#3f3b36] mb-6 text-[#b49a62]">
                <Truck size={24} />
              </div>
              <h3 className="font-serif text-xl mb-3">Premium Delivery</h3>
              <p className="text-sm text-[#9b9387] leading-relaxed">Packaged with care, delivered across Pakistan. Every order is a gift waiting to be unwrapped.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Craft Section */}
      <section className="py-24 px-5 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="order-2 lg:order-1 relative aspect-square w-full overflow-hidden bg-[#efece6]">
            <Image 
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop" 
              alt="Perfume Notes" 
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2 max-w-xl">
            <h2 className="font-serif text-4xl leading-snug">Crafted for the <br /> Modern Individual.</h2>
            <div className="mt-6 h-px w-20 bg-[#b49a62]"></div>
            <p className="mt-6 text-lg leading-relaxed text-[#827b70]">
              Our process starts with a vision: to create scents that resonate with the modern Pakistani lifestyle. We blend traditional oriental notes with contemporary fresh accords.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#827b70]">
              Whether you're stepping into a boardroom or enjoying a quiet evening, ZUNLLY is your invisible armor, leaving a trail of elegance wherever you go.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <section className="border-t border-[#e6e1d9] bg-white py-20 px-5 text-center">
        <h2 className="font-serif text-4xl">Find Your Signature Scent.</h2>
        <p className="mt-4 text-[#827b70]">Explore our exclusive collection and experience the ZUNLLY difference.</p>
        <Link 
          href="/#shop" 
          className="mt-8 inline-block bg-[#1d1c1a] px-10 py-4 text-xs font-semibold uppercase tracking-[.18em] text-white transition-colors hover:bg-[#b49a62]"
        >
          Explore Collection
        </Link>
      </section>

    </main>
  )
}
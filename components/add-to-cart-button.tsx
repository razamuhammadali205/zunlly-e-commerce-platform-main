'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart-provider'
import { ShoppingBag, Check, ArrowRight, Zap } from 'lucide-react'

export default function AddToCartButton({ 
  product 
}: { 
  product: { id: string; name: string; price: number; image: string; variant?: string } 
}) {
  const { add } = useCart()
  const router = useRouter()
  const [isAdded, setIsAdded] = useState(false)

  // Add to Cart Logic
  const handleAddToCart = () => {
    add(product)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  // Buy Now Logic (Direct Checkout)
  const handleBuyNow = () => {
    add(product)
    router.push('/checkout')
  }

  return (
    <div className="mt-10 flex flex-col gap-4">
      
      {/* Row 1: Add to Bag & View Bag */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        <button 
          onClick={handleAddToCart}
          className={`group relative flex w-full sm:w-1/2 items-center justify-center gap-3 px-6 py-4 text-xs font-semibold uppercase tracking-[.18em] text-white transition-all duration-300 ease-out overflow-hidden
            ${isAdded ? 'bg-green-700' : 'bg-[#1d1c1a] hover:bg-[#b49a62] hover:-translate-y-0.5 hover:shadow-lg'}
          `}
        >
          {isAdded ? (
            <>
              <Check size={18} className="animate-in zoom-in" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag size={18} className="transition-transform group-hover:scale-110" />
              <span>Add to Bag</span>
            </>
          )}
        </button>

        <Link 
          href="/cart" 
          className="group flex w-full sm:w-1/2 items-center justify-center gap-2 border border-[#1d1c1a] px-6 py-4 text-xs uppercase tracking-[.18em] text-[#1d1c1a] transition-all duration-300 hover:bg-[#1d1c1a] hover:text-white"
        >
          <span>View Bag</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Row 2: Buy Now Button (Direct Checkout) */}
      <button 
        onClick={handleBuyNow}
        className="group flex w-full items-center justify-center gap-2 bg-[#b49a62] px-6 py-4 text-xs font-semibold uppercase tracking-[.18em] text-white transition-all duration-300 hover:bg-[#1d1c1a] hover:-translate-y-0.5 hover:shadow-lg"
      >
        <Zap size={16} className="fill-current transition-transform group-hover:scale-110" />
        <span>Buy Now</span>
      </button>

    </div>
  )
}
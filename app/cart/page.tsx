'use client'

import Link from 'next/link'
import { useCart } from '@/components/cart-provider'
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { items, total, remove, updateQuantity } = useCart() 

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-5 py-12 text-[#292722]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-xs uppercase tracking-[.18em] text-[#b49a62] hover:text-[#292722] transition-colors">
          ← Back to ZUNLLY
        </Link>
        
        <h1 className="mt-8 font-serif text-5xl">Your Bag</h1>

        {items.length === 0 ? (
          <div className="mt-10 border border-[#e6e1d9] bg-white p-12 text-center">
            <h2 className="font-serif text-2xl mb-2">Your bag is empty</h2>
            <p className="text-[#827b70]">Looks like you haven't added anything yet.</p>
            <Link href="/#shop" className="mt-8 inline-flex items-center gap-2 bg-[#1d1c1a] px-8 py-4 text-xs uppercase tracking-[.18em] text-white hover:bg-[#b49a62] transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            
            {/* Left Side: Cart Items */}
            <div className="border border-[#e6e1d9] bg-white">
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 border-b border-[#e6e1d9] p-4 text-xs font-semibold uppercase tracking-[.12em] text-[#9b9387]">
                <span>Product</span>
                <span>Quantity</span>
                <span>Total</span>
              </div>

              <div className="divide-y divide-[#e6e1d9]">
                {/* ✅ FIX: Key mein variant aur index add kiya hai taake duplicate error na aaye */}
                {items.map((item, index) => (
                  <div key={`${item.id}-${item.variant || 'default'}-${index}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-6">
                    {/* Image */}
                    <div className="w-full sm:w-24 h-32 sm:h-24 shrink-0 overflow-hidden bg-[#f8f7f4]">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover mix-blend-multiply" />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <h2 className="font-serif text-xl leading-tight">{item.name}</h2>
                      {item.variant && (
                        <p className="mt-1 text-xs uppercase tracking-[.12em] text-[#9b9387]">
                          {item.variant}
                        </p>
                      )}
                      <p className="mt-2 font-semibold">PKR {Number(item.price).toLocaleString('en-PK')}</p>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#e6e1d9]">
                        {/* ✅ FIX: Variant pass kiya hai taake sirf specific item update ho */}
                        <button 
                          onClick={() => updateQuantity(item.id, 'decrease', item.variant)}
                          className="p-2 hover:bg-[#f8f7f4] transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 'increase', item.variant)}
                          className="p-2 hover:bg-[#f8f7f4] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Total Price */}
                      <p className="hidden sm:block font-medium w-24 text-right">
                        PKR {(Number(item.price) * item.quantity).toLocaleString('en-PK')}
                      </p>

                      {/* Remove Button */}
                      {/* ✅ FIX: Variant pass kiya hai taake sirf specific item remove ho */}
                      <button 
                        onClick={() => remove(item.id, item.variant)} 
                        className="p-2 text-[#9b9387] hover:text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Order Summary */}
            <aside className="h-fit lg:sticky lg:top-8">
              <div className="border border-[#e6e1d9] bg-white p-6 md:p-8">
                <h2 className="font-serif text-2xl">Order Summary</h2>
                
                <div className="mt-6 space-y-3 text-sm border-b border-[#e6e1d9] pb-6">
                  <div className="flex justify-between text-[#827b70]">
                    <span>Subtotal</span>
                    <span className="text-[#292722]">PKR {Number(total).toLocaleString('en-PK')}</span>
                  </div>
                  <div className="flex justify-between text-[#827b70]">
                    <span>Shipping</span>
                    <span className="text-[#292722]">Calculated at checkout</span>
                  </div>
                </div>

                <div className="mt-6 flex items-baseline justify-between">
                  <span className="font-semibold uppercase tracking-[.12em] text-sm">Estimated Total</span>
                  <span className="font-serif text-3xl">PKR {Number(total).toLocaleString('en-PK')}</span>
                </div>

                {/* Proceed Button */}
                <Link href="/checkout" className="mt-8 flex items-center justify-center gap-3 w-full bg-[#1d1c1a] px-5 py-4 text-xs uppercase tracking-[.18em] text-white hover:bg-[#b49a62] transition-colors">
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>

                {/* Add More Products Button */}
                <Link href="/#shop" className="mt-3 flex items-center justify-center gap-2 w-full border border-[#e6e1d9] bg-white px-5 py-4 text-xs uppercase tracking-[.18em] text-[#292722] hover:bg-[#f8f7f4] transition-colors">
                  Continue Shopping
                </Link>
                
                <p className="mt-6 text-center text-xs text-[#9b9387]">
                  Safe & Secure Checkout
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
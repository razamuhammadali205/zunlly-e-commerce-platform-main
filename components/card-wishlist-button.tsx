'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function CardWishlistButton({ 
  productId, 
  initialIsSaved = false 
}: { 
  productId: string
  initialIsSaved?: boolean 
}) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault() 
    e.stopPropagation()

    const newState = !isSaved
    setIsSaved(newState) // Optimistic update

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login?next=/account/wishlist')
        setIsSaved(!newState) 
        return
      }

      if (newState) {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId })
          
        // ✅ FIX: Agar pehle se saved hai (duplicate), toh error ignore karo
        if (error && error.code !== '23505') { 
          console.error("Wishlist Insert Error:", error)
          setIsSaved(false) // Revert if actual error
        }
      } else {
        await supabase
          .from('wishlist')
          .delete()
          .match({ user_id: user.id, product_id: productId })
      }
      
      router.refresh()
    })
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={isPending}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-md backdrop-blur transition-all hover:scale-110 ${
        isSaved ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
      }`}
      aria-label="Toggle Wishlist"
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24"
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
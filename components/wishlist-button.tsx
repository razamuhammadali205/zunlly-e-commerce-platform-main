'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client' // apna client path check kar lein
import { useRouter } from 'next/navigation'

export function WishlistButton({ 
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
    e.preventDefault() // Taake product link click na ho jaye
    e.stopPropagation()

    // Optimistic UI update
    const newState = !isSaved
    setIsSaved(newState)

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Agar user login nahi hai toh login page pe bhej do
        router.push('/auth/login?next=/account/wishlist')
        setIsSaved(!newState) // revert
        return
      }

      if (newState) {
        // Add to wishlist
        await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId })
      } else {
        // Remove from wishlist
        await supabase.from('wishlist').delete().match({ user_id: user.id, product_id: productId })
      }
      
      router.refresh() // Refresh to update stats if on account page
    })
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={isPending}
      className={`grid h-10 w-10 place-items-center rounded-full bg-white/80 backdrop-blur-md shadow-sm transition-all hover:scale-110 ${
        isSaved ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
      }`}
      aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
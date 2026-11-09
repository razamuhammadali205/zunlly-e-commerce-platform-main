'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function InlineWishlistButton({ 
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

  const toggle = async () => {
    const newState = !isSaved
    setIsSaved(newState)
    
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
          
        // ✅ FIX: Duplicate error ko ignore karo
        if (error && error.code !== '23505') {
          console.error("Wishlist Insert Error:", error)
          setIsSaved(false)
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
      onClick={toggle}
      disabled={isPending}
      className={`flex h-12 items-center justify-center gap-2 rounded-xl border border-[#eadfce] px-4 font-semibold transition-colors ${
        isSaved ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-[#3b281c] hover:bg-[#fbf7f1]'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {isSaved ? 'Saved' : 'Save'}
    </button>
  )
}
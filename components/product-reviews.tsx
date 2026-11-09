'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
    checkIfUserCanReview()
  }, [productId])

  async function fetchReviews() {
    // Reviews fetch karo users ke naam ke sath
    const { data } = await supabase
      .from('product_reviews')
      .select(`*, users(email)`)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    
    if (data) setReviews(data)
    setLoading(false)
  }

  async function checkIfUserCanReview() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check karo ke user ne yeh product khareeda hai ya nahi
    const { data: orders } = await supabase
      .from('order_items')
      .select('order_id, orders!inner(customer_id)')
      .eq('product_id', productId)
      .eq('orders.customer_id', user.id)

    if (orders && orders.length > 0) {
      // Check karo ke pehle se review toh nahi diya
      const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!existingReview) {
        setCanReview(true)
      }
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Order ID fetch karo (jo usne khareeda hai)
    const { data: orderData } = await supabase
      .from('order_items')
      .select('order_id, orders!inner(customer_id)')
      .eq('product_id', productId)
      .eq('orders.customer_id', user.id)
      .single()

    if (!orderData) {
      setMessage('You can only review products you have purchased.')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_id: user.id,
      order_id: orderData.order_id,
      rating,
      review_text: reviewText
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Thank you! Your review has been added.')
      setReviewText('')
      setCanReview(false)
      fetchReviews() // Refresh list
    }
    setSubmitting(false)
  }

  // Average Rating calculate karo
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="mt-16 border-t border-[#e6e1d9] pt-12 max-w-3xl">
      <h2 className="font-serif text-3xl mb-8">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="flex items-center gap-6 mb-10">
        <div className="text-5xl font-serif">{avgRating}</div>
        <div>
          <div className="flex text-[#b49a62]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} fill={star <= Number(avgRating) ? 'currentColor' : 'none'} className="mr-1" />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">Based on {reviews.length} verified reviews</p>
        </div>
      </div>

      {/* Review Form (Sirf buyers ke liye) */}
      {canReview && (
        <form onSubmit={submitReview} className="bg-white border border-[#e6e1d9] p-6 mb-10">
          <h3 className="font-medium mb-4">Write a Review</h3>
          <div className="flex text-[#b49a62] mb-4 cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={24} 
                onClick={() => setRating(star)}
                fill={star <= rating ? 'currentColor' : 'none'} 
                className="mr-1"
              />
            ))}
          </div>
          <textarea
            required
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="What did you like about this fragrance?"
            className="w-full border border-[#e6e1d9] p-3 text-sm outline-none focus:border-[#b49a62] mb-4"
          />
          <button disabled={submitting} type="submit" className="bg-[#1d1c1a] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#b49a62] disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
          {message && <p className="text-sm mt-3 text-green-700">{message}</p>}
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-[#e6e1d9] pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-[#efece6] h-10 w-10 rounded-full flex items-center justify-center">
                  <User size={18} className="text-[#b49a62]" />
                </div>
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    Verified Buyer <CheckCircle2 size={14} className="text-green-600" />
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex text-[#b49a62]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} fill={star <= review.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
            </div>
            <p className="text-sm text-[#827b70] leading-relaxed mt-3">{review.review_text}</p>
          </div>
        ))}

        {reviews.length === 0 && !loading && (
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  )
}
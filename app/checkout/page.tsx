'use client'

import { FormEvent, useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/components/cart-provider'
import { createClient } from '@/lib/supabase/client'
import { Banknote, CreditCard, UploadCloud, CheckCircle2, ShieldCheck, X } from 'lucide-react'

type PaymentMethod = 'cod' | 'advance'
const ADVANCE_DISCOUNT_PERCENT = 5

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const { items: cartItems, clear: clearCart } = useCart()
  
  const buyNowId = searchParams.get('buy_now')
  const buyQty = Number(searchParams.get('qty')) || 1

  const [checkoutItems, setCheckoutItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [form, setForm] = useState({ 
    customerName: '', phone: '', email: '', address: '', city: '', postalCode: '', notes: '' 
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string>('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  
  const [idempotencyKey] = useState(() => crypto.randomUUID())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchCheckoutData = async () => {
      if (buyNowId) {
        const { data: product } = await supabase
          .from('products')
          .select('id, name, price, images')
          .eq('id', buyNowId)
          .single()

        if (product) {
          setCheckoutItems([{
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.images?.[0] || '',
            quantity: buyQty
          }])
        }
      } else {
        setCheckoutItems(cartItems)
      }
      setLoading(false)
    }
    fetchCheckoutData()
  }, [buyNowId, buyQty, cartItems, supabase])

  const numericTotal = useMemo(() => checkoutItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0), [checkoutItems])
  const shipping = numericTotal >= 10000 ? 0 : 250
  const totalBeforeDiscount = numericTotal + shipping
  const discount = paymentMethod === 'advance' && totalBeforeDiscount > 0 ? Math.round((totalBeforeDiscount * ADVANCE_DISCOUNT_PERCENT) / 100) : 0
  const grandTotal = Math.max(0, totalBeforeDiscount - discount)

  function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot 5MB se choti honi chahiye.')
      return
    }
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
    setError('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (paymentMethod === 'advance' && !screenshot) {
      setError('Advance payment ke liye payment screenshot upload karein.')
      return
    }
    
    setBusy(true)

    try {
      // ✅ FORM DATA BANAYEIN (Kyunki screenshot file bhejni hai)
      const formData = new FormData()
      formData.append('customerName', form.customerName)
      formData.append('phone', form.phone)
      formData.append('email', form.email)
      formData.append('address', form.address)
      formData.append('city', form.city)
      formData.append('postalCode', form.postalCode)
      formData.append('notes', form.notes)
      formData.append('paymentMethod', paymentMethod)
      formData.append('idempotencyKey', idempotencyKey)
      
      formData.append(
        'items', 
        JSON.stringify(checkoutItems.map((item) => ({ 
          product_id: item.id, 
          quantity: item.quantity,
          size: item.variant || null
        })))
      )
      
      // Screenshot file attach karein
      if (screenshot) {
        formData.append('screenshot', screenshot)
      }

      // ✅ API Call (Content-Type header mat lagayein)
      const response = await fetch('/api/checkout', { 
        method: 'POST', 
        body: formData 
      })
      
      const textResponse = await response.text();
      let result;
      try {
        result = JSON.parse(textResponse);
      } catch (e) {
        console.error("Invalid JSON from API:", textResponse);
        throw new Error("Server responded with invalid format. Check terminal.");
      }

      if (!response.ok) {
        setError(result.error || 'Could not place your order.')
        setBusy(false)
        return
      }

      if (!buyNowId) await clearCart()
      
      router.push(`/order-confirmation/${result.order.id || result.order.order_number}`)
      
    } catch (err: any) {
      console.error("Checkout Error:", err)
      setError(err.message || 'Network error. Please try again.')
      setBusy(false)
    }
  }

  const inputClass = 'border border-[#e6e1d9] bg-[#f8f7f4] p-3 text-sm outline-none transition-colors focus:border-[#b49a62]'
  const formatPrice = (price: number) => Number(price).toLocaleString('en-PK')

  if (loading) return <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center"><p className="text-[#b49a62] animate-pulse uppercase tracking-widest text-sm font-bold">Loading Checkout...</p></div>

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-5 py-12 text-[#292722]">
      <div className="mx-auto max-w-6xl">
        <Link href={buyNowId ? "/shop" : "/cart"} className="text-xs uppercase tracking-[.18em] text-[#b49a62] hover:text-[#292722] transition-colors">← {buyNowId ? "Back to shop" : "Back to bag"}</Link>
        
        <div className="mt-8 flex items-end justify-between border-b border-[#e6e1d9] pb-6">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl">Secure Checkout</h1>
            <p className="mt-3 text-sm text-[#827b70]">{buyNowId ? 'Express Checkout (Buy Now)' : 'Complete your details to place the order.'}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest text-[#9b9387]"><ShieldCheck size={16} /> SSL Encrypted</div>
        </div>

        {checkoutItems.length > 0 ? (
          <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <section className="border border-[#e6e1d9] bg-white p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1c1a] text-xs text-white">1</span><h2 className="font-serif text-2xl">Delivery Details</h2></div>
                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-medium">Full Name<input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className={inputClass} placeholder="e.g. Ahmed Khan" /></label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">Phone Number<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="03XX XXXXXXX" /></label>
                    <label className="grid gap-2 text-sm font-medium">Email Address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="you@example.com" /></label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium">Complete Address<textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} rows={3} placeholder="House/Flat no, Street, Area" /></label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">City<input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="Karachi" /></label>
                    <label className="grid gap-2 text-sm font-medium">Postal Code<input required value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className={inputClass} placeholder="74000" /></label>
                  </div>
                </div>
              </section>

              <section className="border border-[#e6e1d9] bg-white p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1c1a] text-xs text-white">2</span><h2 className="font-serif text-2xl">Payment Method</h2></div>
                <div className="grid gap-4">
                  <button type="button" onClick={() => setPaymentMethod('cod')} className={`flex items-start gap-4 border p-5 text-left transition-all ${paymentMethod === 'cod' ? 'border-[#1d1c1a] bg-[#f8f7f4] shadow-sm' : 'border-[#e6e1d9] hover:border-[#b49a62]'}`}>
                    <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${paymentMethod === 'cod' ? 'border-[#1d1c1a] bg-[#1d1c1a]' : 'border-gray-300'}`}>{paymentMethod === 'cod' && <CheckCircle2 size={12} className="text-white" />}</div>
                    <div className="flex-1"><div className="flex items-center justify-between"><span className="font-semibold text-lg">Cash on Delivery</span><Banknote className="text-gray-400" /></div><p className="mt-1 text-sm text-[#827b70]">Pay the full amount in cash when your order arrives.</p></div>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('advance')} className={`flex items-start gap-4 border p-5 text-left transition-all ${paymentMethod === 'advance' ? 'border-[#1d1c1a] bg-[#f8f7f4] shadow-sm' : 'border-[#e6e1d9] hover:border-[#b49a62]'}`}>
                    <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${paymentMethod === 'advance' ? 'border-[#1d1c1a] bg-[#1d1c1a]' : 'border-gray-300'}`}>{paymentMethod === 'advance' && <CheckCircle2 size={12} className="text-white" />}</div>
                    <div className="flex-1"><div className="flex items-center justify-between"><span className="font-semibold text-lg flex items-center gap-2">Advance Payment <span className="bg-[#b49a62] text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm">Save 5%</span></span><CreditCard className="text-gray-400" /></div><p className="mt-1 text-sm text-[#827b70]">Pay via Bank Transfer or EasyPaisa and get an instant 5% discount.</p></div>
                  </button>
                </div>

                <AnimatePresence>
                  {paymentMethod === 'advance' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-6 border-t border-[#e6e1d9] pt-6">
                        <div className="bg-[#f8f7f4] border border-[#e6e1d9] p-5 mb-6"><p className="font-semibold text-sm mb-3">Please transfer the amount to:</p><div className="grid gap-2 text-sm text-[#827b70]"><p>Bank: <strong className="text-[#292722]">Meezan Bank</strong></p><p>Account Title: <strong className="text-[#292722]">ZUNLLY</strong></p><p>Account #: <strong className="text-[#292722] text-lg">01234567890123</strong></p><p>JazzCash/EasyPaisa: <strong className="text-[#292722] text-lg">0302 8770999</strong></p></div></div>
                        <div>
                          <p className="mb-2 text-sm font-medium">Upload Payment Screenshot</p>
                          {!screenshotPreview ? (
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-[#d8d1c5] bg-white p-8 text-center transition-colors hover:border-[#b49a62] hover:bg-[#f8f7f4]"><UploadCloud size={28} className="text-[#b49a62]" /><span className="text-xs font-semibold uppercase tracking-[.12em] text-[#292722]">Click to upload screenshot</span><span className="text-[10px] text-[#9b9387]">JPG, PNG — max 5MB</span></button>
                          ) : (
                            <div className="flex items-center gap-4 border border-[#e6e1d9] bg-white p-3"><img src={screenshotPreview} alt="Preview" className="h-16 w-16 object-cover border border-gray-200" /><div className="flex-1"><p className="text-sm font-medium truncate max-w-[200px]">{screenshot?.name}</p><p className="text-xs text-[#9b9387]">{screenshot ? (screenshot.size / 1024).toFixed(1) : 0} KB</p></div><button type="button" onClick={() => { setScreenshot(null); setScreenshotPreview(''); }} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-full transition-colors"><X size={16} /></button></div>
                          )}
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            <aside className="h-fit lg:sticky lg:top-8">
              <div className="border border-[#e6e1d9] bg-[#1d1c1a] p-6 md:p-8 text-white shadow-xl">
                <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
                <div className="max-h-60 space-y-4 overflow-y-auto border-b border-white/10 pb-6 mb-6 pr-2">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-white/5"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /><span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#b49a62] text-[10px] font-bold text-white">{item.quantity}</span></div>
                      <div className="flex-1"><p className="text-sm font-medium leading-tight">{item.name}</p></div>
                      <p className="text-sm font-medium">PKR {formatPrice(Number(item.price) * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 text-sm text-[#d2cec7]">
                  <div className="flex justify-between"><span>Subtotal</span><span>PKR {formatPrice(numericTotal)}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>{shipping === 0 ? 'Free' : `PKR ${formatPrice(shipping)}`}</span></div>
                  {discount > 0 && <div className="flex justify-between font-medium text-[#b49a62]"><span>Advance Discount (5%)</span><span>− PKR {formatPrice(discount)}</span></div>}
                </div>
                <div className="mt-6 flex items-baseline justify-between border-t border-white/15 pt-6"><span className="text-sm uppercase tracking-widest text-[#9b9387]">Total</span><span className="font-serif text-3xl text-white">PKR {formatPrice(grandTotal)}</span></div>
                {error && <p className="mt-4 rounded bg-red-500/20 p-3 text-sm text-red-200 border border-red-500/30">{error}</p>}
                <button type="submit" disabled={busy} className="mt-8 w-full bg-[#b49a62] px-5 py-4 text-xs font-bold uppercase tracking-[.15em] text-white transition-colors hover:bg-white hover:text-[#1d1c1a] disabled:opacity-50">{busy ? 'Processing...' : paymentMethod === 'advance' ? 'Confirm Advance Order' : 'Place COD Order'}</button>
              </div>
            </aside>
          </form>
        ) : (
          <div className="mt-10 border border-[#e6e1d9] bg-white p-12 text-center"><p className="text-[#827b70]">Your bag is empty.</p><Link href="/#shop" className="mt-6 inline-block bg-[#1d1c1a] px-6 py-3 text-xs uppercase tracking-[.18em] text-white hover:bg-[#b49a62]">Continue shopping</Link></div>
        )}
      </div>
    </main>
  )
}
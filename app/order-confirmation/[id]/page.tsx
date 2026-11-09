import Link from 'next/link'
import { CheckCircle2, Package, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch order details to show the order number
  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, total, email')
    .eq('id', id)
    .maybeSingle()

  return (
    <main className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-5 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 text-center shadow-sm border border-[#e6e1d9]">
        
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>

        <h1 className="font-serif text-3xl text-[#292722] mb-2">Order Confirmed!</h1>
        <p className="text-[#827b70] text-sm mb-8">
          Thank you for shopping with ZUNLLY. We have received your order and will process it shortly.
        </p>

        {/* Order Details */}
        <div className="bg-[#f8f7f4] p-5 rounded-2xl mb-8 border border-[#e6e1d9]">
          <p className="text-xs uppercase tracking-wider text-[#9b9387] mb-1">Order Number</p>
          <p className="font-bold text-xl text-[#b49a62]">
            #{order?.order_number || id.slice(0, 8).toUpperCase()}
          </p>
          
          <div className="mt-4 pt-4 border-t border-[#e6e1d9] flex justify-between items-center text-sm">
            <span className="text-[#827b70]">Total Amount</span>
            <span className="font-bold text-[#292722]">PKR {Number(order?.total || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-3">
          <Link 
            href="/account/orders" 
            className="flex items-center justify-center gap-2 w-full bg-[#1d1c1a] text-white py-3.5 rounded-xl font-semibold hover:bg-[#b49a62] transition-colors"
          >
            <Package size={18} /> Track My Order
          </Link>
          <Link 
            href="/shop" 
            className="flex items-center justify-center gap-2 w-full bg-white border border-[#e6e1d9] text-[#292722] py-3.5 rounded-xl font-semibold hover:bg-[#f8f7f4] transition-colors"
          >
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </main>
  )
}
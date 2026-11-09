import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateOrderTracking } from './actions'
import { ArrowLeft, Package, MapPin, Phone, Mail, CreditCard, User, Image as ImageIcon, ExternalLink } from 'lucide-react'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Order + Items
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  // 2. Safe Extraction of Delivery Info
  let deliveryInfo: any = {}
  if (typeof order.delivery_info === 'string') {
    try { deliveryInfo = JSON.parse(order.delivery_info) } catch(e) {}
  } else if (order.delivery_info) {
    deliveryInfo = order.delivery_info
  }

  // 3. Screenshot URL dhoondein (kisi bhi column ya JSON se)
  const screenshotUrl = deliveryInfo?.screenshot_url || order.screenshot_url || null

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      <Link href="/admin/orders" className="text-sm font-semibold text-[#c46c3b] inline-flex items-center gap-1 hover:text-[#a55626] transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#eadfce] shadow-sm">
        <div>
          <h1 className="font-serif text-3xl text-[#3b281c]">
            Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-[#8a6b58] mt-1">
            Placed on {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <div className="bg-[#fbf7f1] px-5 py-3 rounded-xl border border-[#eadfce] text-right">
          <p className="text-xs uppercase tracking-wider text-[#8a6b58] mb-1">Total Amount</p>
          <p className="font-bold text-xl text-[#c46c3b]">PKR {Number(order.total || order.total_amount || 0).toLocaleString('en-PK')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_380px]">
        
        {/* LEFT COLUMN: Details */}
        <div className="space-y-6">
          
          {/* Customer & Delivery Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#eadfce] p-6">
            <h2 className="font-serif text-xl mb-5 flex items-center gap-2 text-[#3b281c]">
              <User size={20} className="text-[#c46c3b]" /> Customer & Delivery Details
            </h2>
            
            <div className="space-y-4 text-sm bg-[#fbf7f1] p-5 rounded-xl border border-[#eadfce]">
              <div className="flex items-center gap-3">
                <User size={16} className="text-[#c46c3b]" />
                <p className="font-medium text-[#3b281c]">{deliveryInfo.fullName || deliveryInfo.customerName || order.customer_name || 'Guest'}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#c46c3b]" />
                <p className="font-medium text-[#3b281c]">{order.phone || deliveryInfo.phone || 'N/A'}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#c46c3b]" />
                <p className="text-[#3b281c]">{order.email || deliveryInfo.email || 'N/A'}</p>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#c46c3b] mt-0.5 shrink-0" />
                <p className="text-[#3b281c]">
                  {deliveryInfo.address || 'Address not provided'},<br/>
                  {deliveryInfo.city} {deliveryInfo.postalCode}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-[#eadfce]">
                <CreditCard size={16} className="text-[#c46c3b]" />
                <p className="text-[#3b281c] capitalize">Payment via: <span className="font-bold">{order.payment_method || 'COD'}</span></p>
              </div>
            </div>

            {/* ✅ PAYMENT SCREENSHOT SECTION */}
            <div className="mt-5 pt-5 border-t border-[#eadfce]">
              <p className="text-sm font-bold text-[#3b281c] mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-[#c46c3b]" /> Payment Screenshot
              </p>
              
              {screenshotUrl ? (
                <div className="relative group inline-block">
                  <a href={screenshotUrl} target="_blank" rel="noreferrer">
                    <img 
                      src={screenshotUrl} 
                      alt="Payment Proof" 
                      className="h-48 w-auto object-contain rounded-xl border border-[#eadfce] shadow-sm bg-gray-50" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-bold">
                      View Full Image
                    </div>
                  </a>
                  <a 
                    href={screenshotUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[#c46c3b] hover:underline"
                  >
                    Open in new tab <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <div className="bg-[#fbf7f1] border border-dashed border-[#eadfce] p-4 rounded-xl text-center">
                  <p className="text-sm text-[#8a6b58]">No screenshot uploaded (or COD order).</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#eadfce] p-6">
            <h2 className="font-serif text-xl mb-4 flex items-center gap-2 text-[#3b281c]">
              <Package size={20} className="text-[#c46c3b]" /> Items Ordered
            </h2>
            <div className="divide-y divide-[#eadfce]">
              {order.order_items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-4">
                  <div>
                    <p className="font-semibold text-[#3b281c]">{item.product_name}</p>
                    <p className="text-sm text-[#8a6b58] mt-0.5">
                      Size: {item.size || 'Standard'} <span className="mx-2">|</span> Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-[#3b281c]">
                    PKR {(Number(item.unit_price || item.price || 0) * item.quantity).toLocaleString('en-PK')}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Tracking Form */}
        <aside className="bg-white rounded-2xl shadow-sm border border-[#eadfce] p-6 h-fit sticky top-8">
          <h2 className="font-serif text-xl mb-5 text-[#3b281c]">Update Tracking</h2>
          
          <form action={updateOrderTracking} className="space-y-5">
            <input type="hidden" name="id" value={order.id} />
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8a6b58] mb-2">Order Status</label>
              <select name="status" defaultValue={order.status} className="w-full border border-[#eadfce] p-3 rounded-xl bg-[#fbf7f1] outline-none focus:border-[#c46c3b] font-medium text-[#3b281c]">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8a6b58] mb-2">Shipping Carrier</label>
              <input type="text" name="shipping_carrier" defaultValue={order.shipping_carrier || ''} placeholder="e.g. TCS, Leopard" className="w-full border border-[#eadfce] p-3 rounded-xl bg-white outline-none focus:border-[#c46c3b] text-[#3b281c]" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8a6b58] mb-2">Tracking Number</label>
              <input type="text" name="tracking_number" defaultValue={order.tracking_number || ''} placeholder="Enter tracking ID" className="w-full border border-[#eadfce] p-3 rounded-xl bg-white outline-none focus:border-[#c46c3b] text-[#3b281c]" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8a6b58] mb-2">Tracking URL (Optional)</label>
              <input type="url" name="tracking_url" defaultValue={order.tracking_url || ''} placeholder="https://..." className="w-full border border-[#eadfce] p-3 rounded-xl bg-white outline-none focus:border-[#c46c3b] text-[#3b281c]" />
            </div>

            <button type="submit" className="w-full bg-[#3b281c] text-white py-3.5 rounded-xl font-bold hover:bg-[#c46c3b] transition-colors mt-2 shadow-sm">
              Save Changes
            </button>
          </form>
        </aside>

      </div>
    </div>
  )
}
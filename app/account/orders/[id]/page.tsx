import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrderCancelButton } from '@/components/order-cancel-button'
import { CopyButton } from '@/components/copy-button'

type OrderItem = {
  product_name: string
  size: string | null
  quantity: number
  unit_price: number
  price?: number
}

type DeliveryInfo = {
  address?: string
  city?: string
  postalCode?: string
  phone?: string
  fullName?: string
  customerName?: string
}

type HistoryEvent = {
  status: string
  note: string | null
  created_at: string
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-blue-50 text-blue-700 ring-blue-200',
  shipped: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
}

const paymentStyles: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  unpaid: 'bg-amber-50 text-amber-700 ring-amber-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  refunded: 'bg-stone-100 text-stone-600 ring-stone-200',
  failed: 'bg-rose-50 text-rose-700 ring-rose-200',
}

const STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const

function StatusPill({ status, styles }: { status: string, styles: Record<string, string> }) {
  const cls = styles[(status || '').toLowerCase()] ?? 'bg-stone-100 text-stone-600 ring-stone-200'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize ring-1 ring-inset ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function ProgressStepper({ status }: { status: string }) {
  const currentIdx = STEPS.indexOf((status || '').toLowerCase() as (typeof STEPS)[number])
  const cancelled = (status || '').toLowerCase() === 'cancelled'

  if (cancelled) {
    return (
      <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
        This order was cancelled.
      </div>
    )
  }

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx
        const isLast = i === STEPS.length - 1
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold transition-colors ${done ? 'bg-[#c46c3b] text-white' : 'bg-white text-[#b7a392] ring-1 ring-[#e6d5c3]'}`}>
                {done ? '✓' : i + 1}
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-wide ${done ? 'text-[#3b281c]' : 'text-[#b7a392]'}`}>
                {step}
              </span>
            </div>
            {!isLast && (
              <span className={`mx-1 mb-4 h-0.5 flex-1 rounded-full ${i < currentIdx ? 'bg-[#c46c3b]' : 'bg-[#e6d5c3]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Safe Data Fetching
  const { data: order } = await supabase
    .from('orders')
    .select(`*, order_items (*)`)
    .eq('id', id)
    .eq('customer_id', user.id)
    .maybeSingle()

  if (!order) notFound()

  // History Fetch with Fallback
  let timeline: HistoryEvent[] = []
  try {
    const { data: history } = await supabase
      .from('order_status_history')
      .select('status,note,created_at')
      .eq('order_id', id)
      .order('created_at', { ascending: true })
    if (history) timeline = history as HistoryEvent[]
  } catch (e) {
    console.log("History table missing.")
  }

  const items = (order.order_items as OrderItem[] | null) ?? []
  const delivery = (order.delivery_info as DeliveryInfo | null) ?? {}
  const orderLabel = order.order_number || `Order #${order.id.slice(0, 8).toUpperCase()}`
  const placedOn = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c46c3b] transition-colors hover:text-[#a55626]">
          <span aria-hidden>←</span> Order history
        </Link>

        {/* Header */}
        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[.2em] text-[#8a6b58]">
              Order placed {placedOn}
            </p>
            <h1 className="mt-2 font-serif text-4xl text-[#3b281c] sm:text-5xl">
              {orderLabel}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill status={order.status} styles={statusStyles} />
              {order.payment_status && (
                <StatusPill status={`payment ${order.payment_status}`} styles={paymentStyles} />
              )}
            </div>
          </div>
          <OrderCancelButton id={order.id} status={order.status} />
        </div>

        {/* Progress */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <ProgressStepper status={order.status} />
        </div>

        {/* ✅ NAYA TRACKING SECTION */}
        {order.tracking_number && (
          <div className="mt-8">
            <h2 className="font-serif text-2xl text-[#3b281c] mb-4 flex items-center gap-2">
              Tracking Information
            </h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-[#3b281c] px-6 py-5 text-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 17l5-5-5-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#efb193] mb-1">
                    {order.shipping_carrier || 'Courier Partner'}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold tracking-widest">{order.tracking_number}</p>
                    <CopyButton text={order.tracking_number} />
                  </div>
                </div>
              </div>

              {/* Track Order Button */}
              {order.tracking_url && (
                <a 
                  href={order.tracking_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="rounded-full bg-[#c46c3b] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a55626] whitespace-nowrap text-center"
                >
                  Track Order →
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Items */}
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#3b281c]">
                Items <span className="ml-2 text-sm font-sans font-normal text-[#8a6b58]">({items.length})</span>
              </h2>
              <div className="mt-5 divide-y divide-[#eadfce]">
                {items.length === 0 ? (
                  <p className="py-4 text-sm text-[#8a6b58]">No items found for this order.</p>
                ) : (
                  items.map((item, i) => {
                    const price = Number(item.unit_price || item.price || 0)
                    return (
                      <div key={i} className="flex items-start justify-between gap-4 py-4">
                        <div className="min-w-0">
                          <p className="font-medium text-[#3b281c]">{item.product_name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#8a6b58]">
                            <span className="rounded-md bg-[#fbf7f1] px-2 py-0.5">{item.size || 'Standard'}</span>
                            <span>Qty {item.quantity}</span>
                            <span aria-hidden>·</span>
                            <span>PKR {price.toLocaleString('en-PK')} each</span>
                          </div>
                        </div>
                        <p className="shrink-0 font-semibold text-[#3b281c]">PKR {(price * item.quantity).toLocaleString('en-PK')}</p>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            {/* Timeline */}
            {timeline.length > 0 && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="font-serif text-2xl text-[#3b281c]">Order timeline</h2>
                <ol className="mt-5 relative border-l border-[#eadfce] pl-6">
                  {timeline.map((event, i) => {
                    const isLatest = i === timeline.length - 1
                    return (
                      <li key={i} className="relative pb-5 last:pb-0">
                        <span className={`absolute -left-[31px] top-1 grid h-3 w-3 place-items-center rounded-full ring-4 ring-white ${isLatest ? 'bg-[#c46c3b]' : 'bg-[#dbc8b5]'}`} />
                        <p className={`text-sm font-semibold capitalize ${isLatest ? 'text-[#c46c3b]' : 'text-[#3b281c]'}`}>{event.status}</p>
                        {event.note && <p className="text-sm text-[#8a6b58]">{event.note}</p>}
                        <p className="mt-0.5 text-xs text-[#b7a392]">{new Date(event.created_at).toLocaleString('en-GB')}</p>
                      </li>
                    )
                  })}
                </ol>
              </section>
            )}
          </div>

          {/* Right column */}
          <aside className="space-y-5">
            {/* Price Summary */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[.18em] text-[#8a6b58]">Summary</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#8a6b58]">Subtotal</dt>
                  <dd className="text-[#3b281c]">PKR {Number(order.total_amount || order.total || 0).toLocaleString('en-PK')}</dd>
                </div>
                <div className="!mt-4 flex justify-between border-t border-[#eadfce] pt-3 text-base font-semibold">
                  <dt className="text-[#3b281c]">Total</dt>
                  <dd className="text-[#c46c3b]">PKR {Number(order.total_amount || order.total || 0).toLocaleString('en-PK')}</dd>
                </div>
              </dl>
              {order.payment_method && (
                <p className="mt-4 text-xs text-[#8a6b58]">
                  Paid via <span className="font-medium capitalize text-[#3b281c]">{order.payment_method}</span>
                </p>
              )}
            </div>

            {/* Delivery */}
            <div className="rounded-3xl bg-[#3b281c] p-6 text-white">
              <p className="text-xs uppercase tracking-[.18em] text-[#efb193]">Delivery address</p>
              <div className="mt-3 space-y-0.5 text-sm leading-6 text-[#ead8ca]">
                {(delivery.fullName || delivery.customerName) && (
                  <p className="font-medium text-white">{delivery.fullName || delivery.customerName}</p>
                )}
                {delivery.address && <p>{delivery.address}</p>}
                {(delivery.city || delivery.postalCode) && (
                  <p>{delivery.city}{delivery.city && delivery.postalCode ? ', ' : ''}{delivery.postalCode}</p>
                )}
                {delivery.phone && <p className="pt-2 text-[#f4c7aa]">{delivery.phone}</p>}
              </div>
            </div>

            {/* Help */}
            <div className="rounded-3xl border border-dashed border-[#dbc8b5] p-5 text-center">
              <p className="text-sm text-[#8a6b58]">Need help with this order?</p>
              <Link href="/contact" className="mt-2 inline-block text-sm font-semibold text-[#c46c3b] hover:text-[#a55626]">
                Contact support →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
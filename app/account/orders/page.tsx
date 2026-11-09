import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | string

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-blue-50 text-blue-700 ring-blue-200',
  shipped: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const key = (status || '').toLowerCase()
  const cls =
    statusStyles[key] ?? 'bg-stone-100 text-stone-600 ring-stone-200'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

export default async function AccountOrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('id,order_number,status,total,created_at')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const count = orders?.length ?? 0

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c46c3b] transition-colors hover:text-[#a55626]"
        >
          <span aria-hidden>←</span> Account overview
        </Link>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-5xl text-[#3b281c]">
              Order history
            </h1>
            <p className="mt-2 text-sm text-[#8a6b58]">
              {count === 0
                ? 'You haven’t placed any orders yet.'
                : `You have ${count} order${count === 1 ? '' : 's'} with us.`}
            </p>
          </div>
          {count > 0 && (
            <Link
              href="/shop"
              className="rounded-full bg-[#3b281c] px-4 py-2 text-sm font-semibold text-[#fbf7f1] transition-colors hover:bg-[#c46c3b]"
            >
              Continue shopping
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-3">
          {count > 0 ? (
            orders!.map((order) => {
              const label =
                order.order_number ||
                `Order #${order.id.slice(0, 8).toUpperCase()}`
              const date = new Date(order.created_at).toLocaleDateString(
                'en-GB',
                { day: '2-digit', month: 'short', year: 'numeric' }
              )
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-[#c46c3b]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c46c3b]"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fbf7f1] text-[#c46c3b] transition-colors group-hover:bg-[#f5e8dc]"
                    >
                      {/* package icon */}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
                        <path d="M3 8v8l9 5 9-5V8" />
                        <path d="M12 13v8" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#3b281c]">
                        {label}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#8a6b58]">
                        <span>{date}</span>
                        <span aria-hidden>·</span>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <p className="font-semibold text-[#c46c3b]">
                      PKR {Number(order.total).toLocaleString('en-PK')}
                    </p>
                    <span
                      aria-hidden
                      className="text-[#8a6b58] transition-transform group-hover:translate-x-0.5 group-hover:text-[#c46c3b]"
                    >
                      →
                    </span>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dbc8b5] bg-white/60 p-10 text-center">
              <div
                aria-hidden
                className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fbf7f1] text-[#c46c3b]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2l1.5 3h9L18 2" />
                  <path d="M3 6h18l-1.5 12a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 6z" />
                  <path d="M9 11v4M15 11v4" />
                </svg>
              </div>
              <p className="mt-4 font-serif text-2xl text-[#3b281c]">
                No orders yet
              </p>
              <p className="mt-1 text-sm text-[#8a6b58]">
                When you place your first order, it will show up here.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block rounded-full bg-[#c46c3b] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a55626]"
              >
                Start shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
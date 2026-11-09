import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Order = {
  id: string
  order_number: string | null
  status: string
  total: number
  created_at: string
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-blue-50 text-blue-700 ring-blue-200',
  shipped: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
}

function StatusPill({ status }: { status: string }) {
  const cls = statusStyles[(status || '').toLowerCase()] ?? 'bg-stone-100 text-stone-600 ring-stone-200'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function initials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
  }
  return (email?.[0] || '?').toUpperCase()
}

// ✅ NAVIGATION UPDATED (Wishlist Added)
const NAV = [
  { href: '/account', label: 'Overview', icon: '◧', active: true },
  { href: '/account/orders', label: 'Order history', icon: '▤' },
  { href: '/account/wishlist', label: 'Wishlist', icon: '♥' },
  { href: '/account/settings', label: 'Settings', icon: '⚙' },
]

const QUICK_ACTIONS = [
  {
    href: '/account/orders',
    label: 'Track orders',
    desc: 'View and track your deliveries',
    icon: <path d="M21 8l-9-5-9 5 9 5 9-5z M3 8v8l9 5 9-5V8 M12 13v8" />,
  },
  {
    href: '/account/wishlist',
    label: 'My Wishlist',
    desc: 'View your saved items',
    icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  },
  {
    href: '/account/settings',
    label: 'Account settings',
    desc: 'Update name, phone and security',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </>
    ),
  },
  {
    href: '/contact',
    label: 'Get help',
    desc: 'Contact our support team',
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
]

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('full_name, phone, role').eq('id', user.id).maybeSingle()

  const { data: ordersData } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  // ✅ Wishlist count fetch kar rahe hain
  const { count: wishlistCount } = await supabase
    .from('wishlist')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const orders = (ordersData as Order[] | null) ?? []
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes((o.status || '').toLowerCase())).length

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'You'
  const recent = orders.slice(0, 5)

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c46c3b] transition-colors hover:text-[#a55626]">
          <span aria-hidden>←</span> Back to ZUNLLY
        </Link>

        <div className="mt-8 grid gap-6 md:grid-cols-[280px_1fr]">
          
          {/* ─── Sidebar ─── */}
          <aside className="md:sticky md:top-8 md:self-start">
            <div className="rounded-3xl bg-[#3b281c] p-6 text-white">
              <p className="text-xs uppercase tracking-[.2em] text-[#efb193]">My account</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#c46c3b] font-serif text-lg text-white">
                  {initials(profile?.full_name, user.email)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-serif text-xl">{displayName}</p>
                  <p className="truncate text-xs text-[#ddc7b5]">{user.email}</p>
                </div>
              </div>

              <nav className="mt-6 grid gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      item.active ? 'bg-white/10 text-white' : 'text-[#ddc7b5] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span aria-hidden className="text-base opacity-80">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>

              <form action="/auth/logout" method="post" className="mt-6">
                <button type="submit" className="w-full rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-[#ddc7b5] transition-colors hover:border-white/30 hover:text-white">
                  Log out
                </button>
              </form>
            </div>
          </aside>

          {/* ─── Content ─── */}
          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h1 className="font-serif text-4xl text-[#3b281c]">Welcome back, {displayName.split(' ')[0]}</h1>
              <p className="mt-2 text-sm text-[#8a6b58]">Here's a quick look at your account activity.</p>

              {/* Stats Grid */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Total orders" value={String(orders.length)} />
                <Stat label="Active orders" value={String(activeOrders)} accent />
                <Stat label="Lifetime spent" value={`PKR ${totalSpent.toLocaleString('en-PK')}`} />
                {/* ✅ Wishlist Stat Added */}
                <Stat label="Wishlist items" value={String(wishlistCount || 0)} />
              </div>
            </div>

            {/* Recent orders */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#3b281c]">Recent orders</h2>
                  <p className="mt-1 text-sm text-[#8a6b58]">Your latest {recent.length} order{recent.length === 1 ? '' : 's'}</p>
                </div>
                {orders.length > 0 && (
                  <Link href="/account/orders" className="text-sm font-semibold text-[#c46c3b] hover:text-[#a55626]">View all →</Link>
                )}
              </div>

              <div className="mt-5 grid gap-3">
                {recent.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#dbc8b5] p-8 text-center">
                    <p className="font-serif text-xl text-[#3b281c]">No orders yet</p>
                    <p className="mt-1 text-sm text-[#8a6b58]">When you place your first order, it will show up here.</p>
                    <Link href="/shop" className="mt-4 inline-block rounded-full bg-[#c46c3b] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a55626]">
                      Start shopping
                    </Link>
                  </div>
                ) : (
                  recent.map((order) => {
                    const label = order.order_number || `Order #${order.id.slice(0, 8).toUpperCase()}`
                    const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    return (
                      <Link key={order.id} href={`/account/orders/${order.id}`} className="group flex items-center justify-between gap-3 rounded-2xl border border-[#eadfce] bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#c46c3b]/40 hover:shadow-sm">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#3b281c]">{label}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8a6b58]">
                            <span>{date}</span>
                            <span aria-hidden>·</span>
                            <StatusPill status={order.status} />
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <p className="font-semibold text-[#c46c3b]">PKR {Number(order.total).toLocaleString('en-PK')}</p>
                          <span aria-hidden className="text-[#8a6b58] transition-transform group-hover:translate-x-0.5 group-hover:text-[#c46c3b]">→</span>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#3b281c]">Quick actions</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {QUICK_ACTIONS.map((a) => (
                  <Link key={a.href} href={a.href} className="group flex items-start gap-3 rounded-2xl border border-[#eadfce] p-4 transition-all hover:-translate-y-0.5 hover:border-[#c46c3b]/40 hover:shadow-sm">
                    <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fbf7f1] text-[#c46c3b] transition-colors group-hover:bg-[#f5e8dc]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        {a.icon}
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#3b281c]">{a.label}</p>
                      <p className="mt-0.5 text-xs text-[#8a6b58]">{a.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value, accent = false }: { label: string, value: string, accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? 'bg-[#c46c3b] text-white' : 'bg-[#fbf7f1] text-[#3b281c]'}`}>
      <p className={`text-xs uppercase tracking-[.14em] ${accent ? 'text-white/80' : 'text-[#8a6b58]'}`}>{label}</p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
    </div>
  )
}
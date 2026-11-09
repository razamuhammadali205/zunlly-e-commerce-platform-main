import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProfile, sendPasswordReset } from './actions'

type PageProps = {
  searchParams: Promise<{ updated?: string; error?: string; reset?: string }>
}

function initials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('')
  }
  return (email?.[0] || '?').toUpperCase()
}

function Banner({
  kind,
  children,
}: {
  kind: 'success' | 'error' | 'info'
  children: React.ReactNode
}) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    error: 'bg-rose-50 text-rose-800 ring-rose-200',
    info: 'bg-[#fbf7f1] text-[#734d35] ring-[#dbc8b5]',
  }[kind]
  return (
    <div
      role="status"
      className={`rounded-2xl px-4 py-3 text-sm ring-1 ring-inset ${styles}`}
    >
      {children}
    </div>
  )
}

// 👇 YAHAN WISHLIST KA LINK ADD KAR DIYA HAI
const NAV = [
  { href: '/account', label: 'Overview', icon: '◧' },
  { href: '/account/orders', label: 'Orders', icon: '▤' },
  { href: '/account/wishlist', label: 'Wishlist', icon: '♥' }, // <-- NEW
  { href: '/account/addresses', label: 'Addresses', icon: '⌂' },
  { href: '/account/settings', label: 'Settings', icon: '⚙' },
]

export default async function AccountSettingsPage({ searchParams }: PageProps) {
  const { updated, error, reset } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .maybeSingle()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'You'

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c46c3b] transition-colors hover:text-[#a55626]"
        >
          <span aria-hidden>←</span> Account overview
        </Link>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-5xl text-[#3b281c]">
              Account settings
            </h1>
            <p className="mt-2 text-sm text-[#8a6b58]">
              Manage your personal details and account security.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <nav className="sticky top-8 space-y-1 rounded-3xl bg-white p-3 shadow-sm">
              {NAV.map((item) => {
                const active = item.href === '/account/settings'
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#3b281c] text-white'
                        : 'text-[#5a4636] hover:bg-[#fbf7f1]'
                    }`}
                  >
                    <span aria-hidden className="text-base">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-6">
            {updated && (
              <Banner kind="success">
                ✓ Your profile has been updated successfully.
              </Banner>
            )}
            {error && (
              <Banner kind="error">
                ✕ Something went wrong: {decodeURIComponent(error)}
              </Banner>
            )}
            {reset && (
              <Banner kind="info">
                ✉ A password reset link has been sent to your email.
              </Banner>
            )}

            {/* Identity card */}
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#c46c3b] font-serif text-2xl text-white">
                  {initials(profile?.full_name, user.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-2xl text-[#3b281c] truncate">
                    {displayName}
                  </p>
                  <p className="text-sm text-[#8a6b58] truncate">
                    {user.email}
                  </p>
                </div>
                {user.email_confirmed_at ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Email verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Unverified
                  </span>
                )}
              </div>
            </section>

            {/* Profile form */}
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-[#3b281c]">
                    Personal information
                  </h2>
                  <p className="mt-1 text-sm text-[#8a6b58]">
                    Update your name and contact number.
                  </p>
                </div>
              </div>

              <form
                action={updateProfile}
                className="mt-6 grid gap-5 sm:grid-cols-2"
              >
                <div className="sm:col-span-1">
                  <label
                    htmlFor="full_name"
                    className="block text-xs font-semibold uppercase tracking-[.14em] text-[#8a6b58]"
                  >
                    Full name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    defaultValue={profile?.full_name ?? ''}
                    placeholder="e.g. Ali Khan"
                    className="mt-2 w-full rounded-xl border border-[#eadfce] bg-white px-4 py-2.5 text-[#3b281c] outline-none transition-colors placeholder:text-[#b7a392] focus:border-[#c46c3b] focus:ring-2 focus:ring-[#c46c3b]/20"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold uppercase tracking-[.14em] text-[#8a6b58]"
                  >
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    defaultValue={profile?.phone ?? ''}
                    placeholder="+92 300 1234567"
                    className="mt-2 w-full rounded-xl border border-[#eadfce] bg-white px-4 py-2.5 text-[#3b281c] outline-none transition-colors placeholder:text-[#b7a392] focus:border-[#c46c3b] focus:ring-2 focus:ring-[#c46c3b]/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-[.14em] text-[#8a6b58]"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    disabled
                    defaultValue={user.email ?? ''}
                    className="mt-2 w-full cursor-not-allowed rounded-xl border border-[#eadfce] bg-[#fbf7f1] px-4 py-2.5 text-[#8a6b58]"
                  />
                  <p className="mt-1.5 text-xs text-[#8a6b58]">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-3 border-t border-[#eadfce] pt-4">
                  <Link
                    href="/account"
                    className="rounded-full px-4 py-2.5 text-sm font-medium text-[#8a6b58] hover:text-[#3b281c]"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="rounded-full bg-[#c46c3b] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a55626]"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </section>

            {/* Security */}
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#3b281c]">Security</h2>
              <p className="mt-1 text-sm text-[#8a6b58]">
                Keep your account protected with a strong password.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#fbf7f1] p-4">
                <div>
                  <p className="font-medium text-[#3b281c]">Password</p>
                  <p className="text-sm text-[#8a6b58]">
                    Send a reset link to {user.email}
                  </p>
                </div>
                <form action={sendPasswordReset}>
                  <button
                    type="submit"
                    className="rounded-full border border-[#c46c3b] px-4 py-2 text-sm font-semibold text-[#c46c3b] transition-colors hover:bg-[#c46c3b] hover:text-white"
                  >
                    Send reset link
                  </button>
                </form>
              </div>
            </section>

            {/* Danger zone */}
            <section className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#3b281c]">Sign out</h2>
              <p className="mt-1 text-sm text-[#8a6b58]">
                You will need to sign in again to access your account.
              </p>
              <form action="/auth/logout" method="post" className="mt-5">
                <button
                  type="submit"
                  className="rounded-full bg-[#3b281c] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c46c3b]"
                >
                  Log out of this device
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
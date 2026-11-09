import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from './actions'

type Address = {
  id: string
  full_name: string
  phone: string
  address: string
  city: string
  postal_code: string | null
  is_default: boolean
}

type PageProps = {
  searchParams: Promise<{ updated?: string; deleted?: string; error?: string }>
}

function Banner({
  kind,
  children,
}: {
  kind: 'success' | 'error'
  children: React.ReactNode
}) {
  const cls =
    kind === 'success'
      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
      : 'bg-rose-50 text-rose-800 ring-rose-200'
  return (
    <div
      role="status"
      className={`rounded-2xl px-4 py-3 text-sm ring-1 ring-inset ${cls}`}
    >
      {children}
    </div>
  )
}

export default async function AddressesPage({ searchParams }: PageProps) {
  const { updated, deleted, error } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('addresses')
    .select('id,full_name,phone,address,city,postal_code,is_default')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('id', { ascending: false })

  const addresses = (data as Address[] | null) ?? []

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
            <h1 className="font-serif text-5xl text-[#3b281c]">Addresses</h1>
            <p className="mt-2 text-sm text-[#8a6b58]">
              Save delivery addresses for faster checkout.
            </p>
          </div>
          <details className="group">
            <summary className="cursor-pointer list-none rounded-full bg-[#c46c3b] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a55626]">
              + Add new address
            </summary>
          </details>
        </div>

        <div className="mt-6 space-y-4">
          {updated && <Banner kind="success">✓ Address saved successfully.</Banner>}
          {deleted && <Banner kind="success">✓ Address removed.</Banner>}
          {error && (
            <Banner kind="error">
              ✕ {decodeURIComponent(error)}
            </Banner>
          )}
        </div>

        {/* Add form (collapsible) */}
        <details className="group mt-6 rounded-3xl bg-white p-6 shadow-sm open:ring-1 open:ring-[#c46c3b]/20">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <div>
              <p className="font-serif text-2xl text-[#3b281c]">Add a new address</p>
              <p className="text-sm text-[#8a6b58]">Fill in the details below.</p>
            </div>
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-full bg-[#fbf7f1] text-[#c46c3b] transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>

          <form action={createAddress} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="full_name" required />
            <Field label="Phone" name="phone" required type="tel" />
            <Field label="Address" name="address" required className="sm:col-span-2" />
            <Field label="City" name="city" required />
            <Field label="Postal code" name="postal_code" />
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[#5a4636]">
              <input
                type="checkbox"
                name="is_default"
                className="h-4 w-4 rounded border-[#eadfce] text-[#c46c3b] focus:ring-[#c46c3b]"
              />
              Set as default address
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-[#c46c3b] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a55626]"
              >
                Save address
              </button>
            </div>
          </form>
        </details>

        {/* List */}
        <div className="mt-6 grid gap-4">
          {addresses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#dbc8b5] bg-white/60 p-10 text-center">
              <p className="font-serif text-2xl text-[#3b281c]">
                No saved addresses
              </p>
              <p className="mt-1 text-sm text-[#8a6b58]">
                Add your first address to speed up checkout.
              </p>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-transparent transition-colors hover:ring-[#c46c3b]/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#3b281c]">
                        {addr.full_name}
                      </p>
                      {addr.is_default && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[#8a6b58]">{addr.phone}</p>
                    <p className="mt-2 text-sm text-[#3b281c]">
                      {addr.address}
                      <br />
                      {addr.city}
                      {addr.postal_code ? `, ${addr.postal_code}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!addr.is_default && (
                      <form action={setDefaultAddress}>
                        <input type="hidden" name="id" value={addr.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-[#c46c3b] px-3 py-1.5 text-xs font-semibold text-[#c46c3b] transition-colors hover:bg-[#c46c3b] hover:text-white"
                        >
                          Set default
                        </button>
                      </form>
                    )}
                    <form action={deleteAddress}>
                      <input type="hidden" name="id" value={addr.id} />
                      <button
                        type="submit"
                        className="rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                {/* Inline edit */}
                <details className="group mt-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[#c46c3b] hover:text-[#a55626]">
                    Edit address
                  </summary>
                  <form
                    action={updateAddress}
                    className="mt-4 grid gap-4 sm:grid-cols-2"
                  >
                    <input type="hidden" name="id" value={addr.id} />
                    <Field
                      label="Full name"
                      name="full_name"
                      defaultValue={addr.full_name}
                      required
                    />
                    <Field
                      label="Phone"
                      name="phone"
                      defaultValue={addr.phone}
                      required
                      type="tel"
                    />
                    <Field
                      label="Address"
                      name="address"
                      defaultValue={addr.address}
                      required
                      className="sm:col-span-2"
                    />
                    <Field label="City" name="city" defaultValue={addr.city} required />
                    <Field
                      label="Postal code"
                      name="postal_code"
                      defaultValue={addr.postal_code ?? ''}
                    />
                    <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[#5a4636]">
                      <input
                        type="checkbox"
                        name="is_default"
                        defaultChecked={addr.is_default}
                        className="h-4 w-4 rounded border-[#eadfce] text-[#c46c3b] focus:ring-[#c46c3b]"
                      />
                      Set as default address
                    </label>
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        className="rounded-full bg-[#3b281c] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c46c3b]"
                      >
                        Update address
                      </button>
                    </div>
                  </form>
                </details>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = 'text',
  className = '',
}: {
  label: string
  name: string
  defaultValue?: string
  required?: boolean
  type?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-xs font-semibold uppercase tracking-[.14em] text-[#8a6b58]"
      >
        {label}
        {required && <span className="text-[#c46c3b]"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-[#eadfce] bg-white px-4 py-2.5 text-[#3b281c] outline-none transition-colors placeholder:text-[#b7a392] focus:border-[#c46c3b] focus:ring-2 focus:ring-[#c46c3b]/20"
      />
    </div>
  )
}
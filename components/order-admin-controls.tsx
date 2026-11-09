'use client'

import { useState } from 'react'

export function OrderAdminControls({ id, status, carrier = '', trackingNumber = '', trackingUrl = '' }: { id: string; status: string; carrier?: string; trackingNumber?: string; trackingUrl?: string }) {
  const [form, setForm] = useState({ status, carrier, trackingNumber, trackingUrl })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    const response = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: form.status, shipping_carrier: form.carrier || null, tracking_number: form.trackingNumber || null, tracking_url: form.trackingUrl || null }) })
    setMessage(response.ok ? 'Saved' : 'Could not save')
    setSaving(false)
  }
  return <div className="mt-4 grid gap-2 border-t border-[#eadfce] pt-4 sm:grid-cols-4"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="rounded-lg border border-[#eadfce] bg-white px-3 py-2 text-sm"><option>confirmed</option><option>processing</option><option>shipped</option><option>delivered</option><option>cancelled</option></select><input value={form.carrier} onChange={(event) => setForm({ ...form, carrier: event.target.value })} placeholder="Carrier" className="rounded-lg border border-[#eadfce] px-3 py-2 text-sm" /><input value={form.trackingNumber} onChange={(event) => setForm({ ...form, trackingNumber: event.target.value })} placeholder="Tracking number" className="rounded-lg border border-[#eadfce] px-3 py-2 text-sm" /><div className="flex gap-2"><input value={form.trackingUrl} onChange={(event) => setForm({ ...form, trackingUrl: event.target.value })} placeholder="Tracking URL" className="min-w-0 flex-1 rounded-lg border border-[#eadfce] px-3 py-2 text-sm" /><button onClick={save} disabled={saving} className="rounded-lg bg-[#3b281c] px-3 py-2 text-sm text-white">{saving ? '...' : 'Save'}</button></div>{message && <p className="text-xs text-[#8a6b58] sm:col-span-4">{message}</p>}</div>
}

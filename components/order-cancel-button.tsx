'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function OrderCancelButton({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  if (!['pending', 'confirmed'].includes(status)) return null
  async function cancel() {
    if (!window.confirm('Cancel this order?')) return
    setBusy(true)
    const response = await fetch(`/api/orders/${id}/cancel`, { method: 'POST' })
    const result = await response.json()
    if (response.ok) router.refresh()
    else setMessage(result.error || 'Unable to cancel order.')
    setBusy(false)
  }
  return <div className="mt-5"><button onClick={cancel} disabled={busy} className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 disabled:opacity-50">{busy ? 'Cancelling...' : 'Cancel order'}</button>{message && <p className="mt-2 text-xs text-red-700">{message}</p>}</div>
}

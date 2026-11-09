"use client"

import Link from "next/link"
import { useState } from "react"

export function ProductActions({ id, stock, status }: { id: string; stock: number; status: string }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  async function updateStock(value: string) {
    const nextStock = Number(value)
    if (!Number.isInteger(nextStock) || nextStock < 0) return
    setBusy(true)
    setMessage("")
    const response = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, stock: nextStock }) })
    setMessage(response.ok ? "Saved" : "Could not save")
    setBusy(false)
    if (response.ok) window.location.reload()
  }

  async function updateStatus(nextStatus: string) {
    setBusy(true)
    const response = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: nextStatus }) })
    setMessage(response.ok ? "Saved" : "Could not save")
    setBusy(false)
    if (response.ok) window.location.reload()
  }

  async function archive() {
    if (!window.confirm("Delete this product permanently? Products in order history will be archived instead to preserve customer records.")) return
    setBusy(true)
    const response = await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setMessage(response.ok ? (await response.clone().json()).action === "deleted" ? "Deleted permanently" : "Archived for order history" : "Could not delete")
    setBusy(false)
    if (response.ok) window.location.reload()
  }

  return <div className="flex flex-wrap items-center gap-2 text-xs"><Link href={`/admin/products/${id}/edit`} className="rounded-lg border border-[#eadfce] px-3 py-2 font-semibold hover:bg-[#fcf7ef]">Edit</Link><input aria-label="Stock quantity" defaultValue={stock} type="number" min="0" onBlur={(event) => updateStock(event.target.value)} disabled={busy} className="w-20 rounded-lg border border-[#eadfce] px-2 py-2" /><select aria-label="Product status" defaultValue={status} onChange={(event) => updateStatus(event.target.value)} disabled={busy} className="rounded-lg border border-[#eadfce] bg-white px-2 py-2 capitalize"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><button type="button" onClick={archive} disabled={busy} className="rounded-lg border border-red-200 px-3 py-2 text-red-700">Delete</button>{message && <span className="text-[#8a6b58]">{message}</span>}</div>
}

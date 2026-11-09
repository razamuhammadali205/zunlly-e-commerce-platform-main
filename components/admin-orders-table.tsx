'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { OrderAdminControls } from '@/components/order-admin-controls'
import { getProductImageUrl } from '@/lib/product-image'

type Order = { id: string; order_number: string | null; status: string; payment_status: string; total: number; delivery_info: { customerName?: string; phone?: string; email?: string; city?: string; address?: string } | null; shipping_carrier?: string | null; tracking_number?: string | null; tracking_url?: string | null; created_at: string; created_at_label: string; order_items?: { product_name: string; product_image?: string | null; size?: string | null; quantity: number; unit_price: number }[] }

export function AdminOrdersTable({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const filtered = useMemo(() => orders.filter((order) => {
    const info = order.delivery_info || {}
    const haystack = [order.order_number, info.customerName, info.phone, info.email, info.city].filter(Boolean).join(' ').toLowerCase()
    return (status === 'all' || order.status === status) && haystack.includes(query.toLowerCase())
  }), [orders, query, status])
  return <div><div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#eadfce] bg-white p-4 sm:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, phone, email, city" className="min-w-0 flex-1 rounded-lg border border-[#eadfce] px-3 py-2 text-sm" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-[#eadfce] bg-white px-3 py-2 text-sm"><option value="all">All statuses</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></div><div className="mt-4 grid gap-4">{filtered.map((order) => <article key={order.id} className="rounded-2xl border border-[#eadfce] bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-semibold">{order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}</p><p className="text-sm text-[#8a6b58]">{order.created_at_label} · COD · {order.payment_status}</p><p className="mt-2 text-sm text-[#8a6b58]">{order.delivery_info?.customerName} · {order.delivery_info?.city}</p></div><div className="text-right"><p className="font-semibold text-[#c46c3b]">PKR {Number(order.total).toLocaleString('en-PK')}</p><p className="text-sm capitalize text-[#8a6b58]">{order.status}</p></div></div><div className="mt-5 grid gap-3 border-t border-[#eadfce] pt-4 sm:grid-cols-2">{order.order_items?.map((item, index) => <div key={index} className="flex gap-3 text-sm"><div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#f4ede5]">{item.product_image && <Image src={getProductImageUrl([item.product_image])} alt="" fill sizes="48px" className="object-cover" />}</div><div><p className="font-medium">{item.product_name}</p><p className="text-[#8a6b58]">{item.size || 'Standard'} · Qty {item.quantity}</p></div></div>)}</div><OrderAdminControls id={order.id} status={order.status} carrier={order.shipping_carrier || ''} trackingNumber={order.tracking_number || ''} trackingUrl={order.tracking_url || ''} /></article>)}{!filtered.length && <p className="rounded-2xl border border-dashed border-[#dbc8b5] p-8 text-center text-[#8a6b58]">No orders match this filter.</p>}</div></div>
}

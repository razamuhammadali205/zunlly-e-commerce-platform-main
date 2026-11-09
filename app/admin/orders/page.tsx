'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, ArrowRight, Package, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react'

type Order = {
  id: string
  order_number: string | null
  customer_name: string | null
  total: number
  status: string
  payment_method: string
  created_at: string
  delivery_info: any
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-blue-50 text-blue-700 ring-blue-200',
  shipped: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export default function AdminOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, total, status, payment_method, created_at, delivery_info')
        .order('created_at', { ascending: false })
      
      if (data) setOrders(data as Order[])
      setLoading(false)
    }
    fetchOrders()
  }, [supabase])

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch = 
        (order.order_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (order.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (order.delivery_info?.phone || '').includes(search)
      
      const matchFilter = filter === 'all' || order.status.toLowerCase() === filter.toLowerCase()
      
      return matchSearch && matchFilter
    })
  }, [orders, search, filter])

  // Stats
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => ['pending', 'processing'].includes(o.status.toLowerCase())).length,
      shipped: orders.filter(o => o.status.toLowerCase() === 'shipped').length,
      delivered: orders.filter(o => o.status.toLowerCase() === 'delivered').length,
    }
  }, [orders])

  if (loading) {
    return (
      <div className="p-10 flex justify-center items-center h-64 text-[#8a6b58]">
        Loading orders...
      </div>
    )
  }

  return (
    <section className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#c46c3b]">Operations</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl text-[#3b281c]">Orders</h1>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#eadfce] shadow-sm">
          <Search size={18} className="text-[#8a6b58]" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-48 placeholder:text-[#b7a392]"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#eadfce] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#fbf7f1] text-[#3b281c] rounded-xl"><Package size={20} /></div>
          <div><p className="text-xs text-[#8a6b58] uppercase tracking-wider">Total</p><p className="text-2xl font-serif font-bold text-[#3b281c]">{stats.total}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#eadfce] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={20} /></div>
          <div><p className="text-xs text-[#8a6b58] uppercase tracking-wider">Pending</p><p className="text-2xl font-serif font-bold text-[#3b281c]">{stats.pending}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#eadfce] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Truck size={20} /></div>
          <div><p className="text-xs text-[#8a6b58] uppercase tracking-wider">Shipped</p><p className="text-2xl font-serif font-bold text-[#3b281c]">{stats.shipped}</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#eadfce] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
          <div><p className="text-xs text-[#8a6b58] uppercase tracking-wider">Delivered</p><p className="text-2xl font-serif font-bold text-[#3b281c]">{stats.delivered}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
              filter === f 
                ? 'bg-[#3b281c] text-white shadow-md' 
                : 'bg-white text-[#8a6b58] border border-[#eadfce] hover:bg-[#fbf7f1]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#eadfce] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#fbf7f1] text-[#8a6b58] text-xs uppercase tracking-wider border-b border-[#eadfce]">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eadfce]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#8a6b58]">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fbf7f1]/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#3b281c]">
                      #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#3b281c]">{order.customer_name || order.delivery_info?.fullName || 'Guest'}</p>
                      <p className="text-xs text-[#8a6b58]">{order.delivery_info?.city || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-[#8a6b58]">
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 capitalize text-[#8a6b58]">
                      {order.payment_method === 'cod' ? 'COD' : 'Advance'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#c46c3b]">
                      PKR {Number(order.total).toLocaleString('en-PK')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[order.status.toLowerCase()] || 'bg-stone-100 text-stone-600 ring-stone-200'}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`} 
                        className="inline-flex items-center gap-1 text-[#c46c3b] hover:text-[#a55626] font-semibold bg-[#fbf7f1] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Manage <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  )
}
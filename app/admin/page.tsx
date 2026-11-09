import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Package, Users, ShoppingBag, DollarSign, ArrowRight } from 'lucide-react'

export default async function AdminOverview() {
  const supabase = await createClient()

  // 1. Fetch Stats
  const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: totalCustomers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer')
  const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true })
  
  const { data: orders } = await supabase.from('orders').select('total')
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0

  // 2. Fetch Recent Orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#3b281c]">Overview</h1>
          <p className="text-sm text-[#8a6b58] mt-1">Here's what's happening with your store today.</p>
        </div>
        <Link href="/admin/products/new" className="bg-[#3b281c] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#c46c3b] transition-colors text-center">
          + Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`PKR ${totalRevenue.toLocaleString('en-PK')}`} icon={<DollarSign size={20} />} />
        <StatCard title="Total Orders" value={String(totalOrders || 0)} icon={<ShoppingBag size={20} />} />
        <StatCard title="Customers" value={String(totalCustomers || 0)} icon={<Users size={20} />} />
        <StatCard title="Products" value={String(totalProducts || 0)} icon={<Package size={20} />} />
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#eadfce] overflow-hidden">
        <div className="p-6 border-b border-[#eadfce] flex justify-between items-center">
          <h2 className="font-serif text-xl text-[#3b281c]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-[#c46c3b] flex items-center gap-1 hover:text-[#a55626]">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbf7f1] text-[#8a6b58] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eadfce]">
              {recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-[#fbf7f1]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#3b281c]">
                    #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">{order.customer_name || 'Guest'}</td>
                  <td className="px-6 py-4 text-[#8a6b58]">{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="px-6 py-4 font-semibold">PKR {Number(order.total).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 capitalize">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-[#c46c3b] hover:underline font-medium">Manage</Link>
                  </td>
                </tr>
              ))}
              {!recentOrders?.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#8a6b58]">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#eadfce] shadow-sm flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-[#fbf7f1] text-[#c46c3b] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[#8a6b58]">{title}</p>
        <h3 className="text-2xl font-bold text-[#3b281c] mt-0.5">{value}</h3>
      </div>
    </div>
  )
}
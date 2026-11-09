import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut, LineChart, Boxes } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') redirect('/account')

  const navItems = [
    { name: 'Overview', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={18} /> },
    { name: 'Products', href: '/admin/products', icon: <Package size={18} /> },
    { name: 'Inventory', href: '/admin/inventory', icon: <Boxes size={18} /> },
    { name: 'Customers', href: '/admin/customers', icon: <Users size={18} /> },
    { name: 'Analytics', href: '/admin/analytics', icon: <LineChart size={18} /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
  ]

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#3b281c] flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-[#1d1c1a] text-white p-6 md:flex flex-col z-50">
        <div>
          <Link href="/" className="font-serif text-3xl tracking-[.1em]">ZUNLLY</Link>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[.2em] text-[#b49a62]">Admin Studio</p>
        </div>

        <nav className="mt-10 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/10">
          <form action="/auth/logout" method="post">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
              <LogOut size={18} />
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>

    </div>
  )
}
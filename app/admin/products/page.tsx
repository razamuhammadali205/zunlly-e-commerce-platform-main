import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteProduct } from './actions'
import { Plus, Trash2, Edit, PackageOpen } from 'lucide-react'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, stock, category, images')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[#3b281c]">Products</h1>
          <p className="text-sm text-[#8a6b58] mt-1">Manage your inventory and prices.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-[#3b281c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#c46c3b] transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#eadfce] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbf7f1] text-[#8a6b58] text-xs uppercase tracking-wider border-b border-[#eadfce]">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eadfce]">
              {products?.map((product) => (
                <tr key={product.id} className="hover:bg-[#fbf7f1]/50 transition-colors group">
                  
                  {/* Product Info */}
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl overflow-hidden border border-[#eadfce] shrink-0 bg-white">
                      <img 
                        src={product.images?.[0] || '/placeholder.jpg'} 
                        alt={product.name} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[#3b281c] line-clamp-1">{product.name}</p>
                      <p className="text-xs text-[#8a6b58] mt-0.5">ID: {product.id.slice(0, 8)}</p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-[#fbf7f1] text-[#8a6b58] text-xs font-medium border border-[#eadfce]">
                      {product.category || 'Uncategorized'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 font-bold text-[#c46c3b]">
                    PKR {Number(product.price).toLocaleString()}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      
                      {/* Edit Button */}
                      <Link 
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 text-gray-500 hover:text-[#c46c3b] bg-white border border-[#eadfce] hover:border-[#c46c3b] rounded-lg transition-all shadow-sm" 
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </Link>

                      {/* Delete Button */}
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button 
                          type="submit" 
                          className="p-2 text-gray-500 hover:text-rose-600 bg-white border border-[#eadfce] hover:border-rose-300 rounded-lg transition-all shadow-sm" 
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>

                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Empty State */}
              {!products?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 bg-[#fbf7f1] rounded-full flex items-center justify-center mb-4">
                        <PackageOpen size={32} className="text-[#c46c3b]" />
                      </div>
                      <p className="font-serif text-xl text-[#3b281c]">No products found</p>
                      <p className="text-sm text-[#8a6b58] mt-1 mb-4">Add your first product to start selling.</p>
                      <Link href="/admin/products/new" className="bg-[#3b281c] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#c46c3b] transition-colors">
                        Add Product
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
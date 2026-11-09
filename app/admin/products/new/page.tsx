import Link from 'next/link'
import { createProduct } from '../actions'
import { ArrowLeft, UploadCloud, Package, DollarSign, Layers, Star, ShieldCheck, Tag } from 'lucide-react'

export default function NewProductPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-sm font-semibold text-[#c46c3b] inline-flex items-center gap-1 hover:text-[#a55626] mb-2 transition-colors">
            <ArrowLeft size={16} /> Back to Products
          </Link>
          <h1 className="font-serif text-3xl text-[#3b281c]">List a New Product</h1>
        </div>
      </div>
      
      {/* ✅ enctype add kiya taake file upload ho sake */}
      <form action={createProduct} encType="multipart/form-data" className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#eadfce] space-y-5">
            <h2 className="font-serif text-xl border-b border-[#eadfce] pb-3 mb-4 text-[#3b281c] flex items-center gap-2">
              <Package size={20} className="text-[#c46c3b]"/> Basic Information
            </h2>
            <div>
              <label className="block text-sm font-bold text-[#3b281c] mb-2">Product Title *</label>
              <input required type="text" name="name" placeholder="e.g. ZUNLLY Midnight Oud 100ml" className="w-full border border-[#eadfce] p-3.5 rounded-xl outline-none focus:border-[#c46c3b] focus:ring-2 focus:ring-[#c46c3b]/20 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#3b281c] mb-2">Description</label>
              <textarea name="description" rows={5} placeholder="Describe your product..." className="w-full border border-[#eadfce] p-3.5 rounded-xl outline-none focus:border-[#c46c3b] focus:ring-2 focus:ring-[#c46c3b]/20 transition-all text-sm resize-y" />
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#eadfce] space-y-5">
            <h2 className="font-serif text-xl border-b border-[#eadfce] pb-3 mb-4 text-[#3b281c] flex items-center gap-2">
              <Tag size={20} className="text-[#c46c3b]"/> Specifications
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="block text-sm font-bold mb-2">Brand</label><input type="text" name="brand" placeholder="e.g. ZUNLLY" className="w-full border p-3.5 rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-2">Condition</label><select name="condition" className="w-full border p-3.5 rounded-xl bg-white"><option value="New">New</option><option value="Used">Used</option></select></div>
              <div><label className="block text-sm font-bold mb-2">Size</label><input type="text" name="size_ml" placeholder="e.g. 100ml" className="w-full border p-3.5 rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-2">Notes</label><input type="text" name="fragrance_notes" placeholder="e.g. Oud, Rose" className="w-full border p-3.5 rounded-xl" /></div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#eadfce] space-y-5">
            <h2 className="font-serif text-xl border-b border-[#eadfce] pb-3 mb-4 text-[#3b281c] flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#c46c3b]"/> Features & Policies
            </h2>
            <div>
              <label className="block text-sm font-bold mb-2">Key Features (One per line)</label>
              <textarea name="features" rows={4} placeholder="Long lasting&#10;Premium ingredients" className="w-full border p-3.5 rounded-xl resize-y" />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="block text-sm font-bold mb-2">Warranty</label><input type="text" name="warranty" placeholder="e.g. No Warranty" className="w-full border p-3.5 rounded-xl" /></div>
              <div><label className="block text-sm font-bold mb-2">Return Policy</label><input type="text" name="return_policy" placeholder="e.g. 7 Days Return" className="w-full border p-3.5 rounded-xl" /></div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eadfce]">
            <h2 className="font-serif text-xl border-b border-[#eadfce] pb-3 mb-4 text-[#3b281c]">Product Image *</h2>
            <div className="border-2 border-dashed border-[#d8d1c5] p-6 text-center rounded-xl bg-[#fbf7f1] hover:bg-[#f8f7f4] transition-colors relative group">
              {/* ✅ File input field sahi kiya hai */}
              <input required type="file" name="image" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <UploadCloud size={28} className="text-[#c46c3b]" />
              </div>
              <p className="text-sm font-bold text-[#3b281c]">Click to upload</p>
              <p className="text-xs text-[#8a6b58] mt-1">JPG, PNG (max. 5MB)</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eadfce] space-y-5">
            <h2 className="font-serif text-xl border-b border-[#eadfce] pb-3 mb-4 text-[#3b281c] flex items-center gap-2">
              <DollarSign size={20} className="text-[#c46c3b]"/> Price & Stock
            </h2>
            <div>
              <label className="block text-sm font-bold mb-2">Price (PKR) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">PKR</span>
                <input required type="number" name="price" placeholder="4500" className="w-full border p-3.5 pl-14 rounded-xl font-semibold" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Stock Quantity *</label>
              <input required type="number" name="stock" placeholder="e.g. 50" className="w-full border p-3.5 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center gap-2"><Layers size={16} /> Category</label>
              <select name="category" className="w-full border p-3.5 rounded-xl bg-white">
                <option value="For Him">For Him</option>
                <option value="For Her">For Her</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#1d1c1a] text-white py-4 rounded-xl font-bold hover:bg-[#c46c3b] transition-colors shadow-lg flex items-center justify-center gap-2">
            <Star size={18} /> Publish Listing
          </button>
        </div>
      </form>
    </div>
  )
}
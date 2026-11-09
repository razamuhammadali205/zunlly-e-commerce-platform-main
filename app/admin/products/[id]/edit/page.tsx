import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ProductEditForm } from "@/components/product-edit-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from("products").select("id,name,brand,sku,description,price,compare_at_price,stock,status,category_id,fragrance_notes,sizes,images").eq("id", id).single()
  if (!product) notFound()
  return <main className="min-h-screen bg-[#fbfaf8] px-6 py-8 text-[#171717] lg:px-12"><div className="mx-auto max-w-5xl"><Link href="/admin/products" className="text-sm text-[#666]">Back to products</Link><h1 className="mt-8 font-serif text-5xl">Edit product</h1><p className="mt-2 text-sm text-[#777]">Update catalog information, pricing, imagery, and availability.</p><ProductEditForm product={product} /></div></main>
}

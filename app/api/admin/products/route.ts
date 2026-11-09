import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getProductImagePaths } from "@/lib/product-image"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { supabase, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  return { supabase, user }
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response
  const body = await request.json()
  const name = String(body.name || "").trim()
  const description = String(body.description || "").trim()
  const price = Number(body.price)
  const stock = Number(body.stock)
  const status = body.status === "published" ? "published" : "draft"
  if (!name || !description || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
    return NextResponse.json({ error: "Name, description, price, and a valid stock quantity are required." }, { status: 400 })
  }
  const { data, error } = await auth.supabase.from("products").insert({
    name,
    slug: String(body.slug || name).trim(),
    sku: body.sku ? String(body.sku).trim() : null,
    brand: String(body.brand || "ZUNLLY").trim(),
    description,
    price,
    compare_at_price: body.compare_at_price === "" || body.compare_at_price == null ? null : Number(body.compare_at_price),
    category_id: body.category_id || null,
    fragrance_notes: body.fragrance_notes || [],
    sizes: body.sizes || [],
    images: body.images || [],
    stock,
    status,
    created_by: auth.user.id,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ product: data }, { status: 201 })
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response
  const body = await request.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: "Product id is required" }, { status: 400 })
  const allowed = ["name", "slug", "sku", "description", "price", "compare_at_price", "category_id", "fragrance_notes", "sizes", "images", "stock", "status"]
  const payload = Object.fromEntries(Object.entries(updates).filter(([key]) => allowed.includes(key)))
  const { data, error } = await auth.supabase.from("products").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ product: data })
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "Product id is required" }, { status: 400 })
  const { data: product, error: productError } = await auth.supabase.from("products").select("id,images").eq("id", id).single()
  if (productError || !product) return NextResponse.json({ error: "Product not found." }, { status: 404 })
  const { count: orderCount, error: orderError } = await auth.supabase.from("order_items").select("id", { count: "exact", head: true }).eq("product_id", id)
  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 400 })
  if ((orderCount || 0) > 0) {
    const { error } = await auth.supabase.from("products").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, action: "archived", message: "This product is kept as an archive because it appears in order history." })
  }
  const admin = createAdminClient()
  const paths = getProductImagePaths(product.images)
  if (paths.length) await admin.storage.from("product-images").remove(paths)
  const { error } = await admin.from("products").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, action: "deleted" })
}

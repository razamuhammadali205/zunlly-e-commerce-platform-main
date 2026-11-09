import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Please sign in before checkout." }, { status: 401 })
    }

    // ✅ SMART CONTENT-TYPE CHECK
    const contentType = request.headers.get("content-type") || ""
    let bodyData: any = {}
    let screenshotFile: File | null = null

    if (contentType.includes("multipart/form-data")) {
      // Agar FormData aya hai (screenshot ke sath)
      const formData = await request.formData()
      bodyData = {
        customerName: formData.get('customerName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        postalCode: formData.get('postalCode'),
        notes: formData.get('notes'),
        paymentMethod: formData.get('paymentMethod'),
        idempotencyKey: formData.get('idempotencyKey'),
        items: JSON.parse(String(formData.get('items') || '[]')),
      }
      screenshotFile = formData.get('screenshot') as File | null
    } else {
      // Agar JSON aya hai (normal order)
      bodyData = await request.json()
    }
    
    const customerName = String(bodyData.customerName || '').trim()
    const phone = String(bodyData.phone || '').trim()
    const email = String(bodyData.email || user.email || '').trim()
    const address = String(bodyData.address || '').trim()
    const city = String(bodyData.city || '').trim()
    const postalCode = String(bodyData.postalCode || '').trim()
    const notes = String(bodyData.notes || '').trim()
    const paymentMethod = String(bodyData.paymentMethod || 'cod')
    const idempotencyKey = String(bodyData.idempotencyKey || crypto.randomUUID())
    const items = Array.isArray(bodyData.items) ? bodyData.items : []

    if (!customerName || !phone || !address || !city || !postalCode || !items.length) {
      return NextResponse.json({ error: "Please complete all required checkout fields." }, { status: 400 })
    }

    // ✅ 1. Screenshot Upload (Agar mojood hai)
    let screenshotUrl = null
    if (paymentMethod === 'advance' && screenshotFile && screenshotFile.size > 0) {
      const fileExt = screenshotFile.name.split('.').pop()
      const fileName = `proof-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, screenshotFile)

      if (uploadError) {
        console.error("❌ SCREENSHOT UPLOAD ERROR:", uploadError)
        return NextResponse.json({ error: "Failed to upload payment screenshot." }, { status: 400 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)
        
      screenshotUrl = publicUrl
    }

    // 2. RPC Call (Order Creation)
    const { data: rpcData, error: rpcError } = await supabase.rpc("create_cod_order", {
      p_customer_id: user.id,
      p_delivery_info: { 
        customerName: customerName || 'Customer', 
        phone: phone || 'N/A', 
        email: email || 'guest@zunlly.com', 
        address: address || 'N/A', 
        city: city || 'N/A', 
        postalCode: postalCode || '00000', 
        notes: notes || '',
        screenshot_url: screenshotUrl
      },
      p_items: items.map((item: any) => ({
        product_id: item.product_id,
        quantity: Math.floor(Number(item.quantity)),
        size: item.size || null,
      })),
      p_idempotency_key: idempotencyKey,
    })

    if (rpcError) {
      console.error("❌ RPC ERROR:", rpcError)
      return NextResponse.json({ error: `Database Error: ${rpcError.message}` }, { status: 400 })
    }

    // 3. Update Order Info (Email aur Screenshot URL save karein)
    const orderId = rpcData?.id || rpcData?.order_id;
    if (orderId) {
      await supabase.from('orders').update({
        email: email || 'guest@zunlly.com',
        delivery_info: { 
          customerName: customerName || 'Customer', 
          phone: phone || 'N/A', 
          email: email || 'guest@zunlly.com', 
          address: address || 'N/A', 
          city: city || 'N/A', 
          postalCode: postalCode || '00000', 
          notes: notes || '',
          screenshot_url: screenshotUrl
        },
        payment_method: paymentMethod
      }).eq('id', orderId)
    }

    return NextResponse.json({ order: rpcData }, { status: 201 })

  } catch (error: any) {
    console.error("❌ API CRASH ERROR:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
import Link from 'next/link'
import { Truck, RotateCcw, ShieldCheck, Banknote, RefreshCw, PackageCheck, AlertCircle } from 'lucide-react'

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292722] pb-24">
      
      {/* Header Section */}
      <section className="px-5 pt-12 pb-16 md:px-8 lg:px-12 max-w-4xl mx-auto border-b border-[#e6e1d9]">
        <Link href="/" className="text-xs uppercase tracking-[.18em] text-[#b49a62] hover:text-[#292722] transition-colors">
          ← Back to ZUNLLY
        </Link>
        
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-4 text-[#b49a62]">
            <Truck size={28} />
            <span className="text-xs font-semibold uppercase tracking-[.2em]">Logistics & Care</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl">Shipping & Returns</h1>
          <p className="mt-6 text-lg text-[#827b70] leading-relaxed">
            We want your ZUNLLY experience to be as seamless as possible. From the moment you place your order to the day it arrives at your doorstep, we handle everything with care.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-5 py-16 md:px-8 lg:px-12 max-w-3xl mx-auto">
        <div className="space-y-16">
          
          {/* 1. Shipping Details */}
          <div>
            <h2 className="font-serif text-3xl mb-6">Shipping Information</h2>
            <p className="text-[#827b70] leading-relaxed mb-6">
              We currently ship all across Pakistan. Whether you're in a bustling city or a quiet town, we make sure your fragrance reaches you safely.
            </p>
            
            <div className="grid gap-4 sm:grid-cols-2 mt-8">
              <div className="border border-[#e6e1d9] bg-white p-6">
                <Banknote className="text-[#b49a62] mb-3" size={24} />
                <h3 className="font-medium mb-2">Delivery Charges</h3>
                <p className="text-sm text-[#827b70]">Flat rate of PKR 250 nationwide. <strong className="text-[#292722]">Free shipping</strong> on all orders above PKR 10,000.</p>
              </div>
              <div className="border border-[#e6e1d9] bg-white p-6">
                <PackageCheck className="text-[#b49a62] mb-3" size={24} />
                <h3 className="font-medium mb-2">Dispatch Time</h3>
                <p className="text-sm text-[#827b70]">Orders are dispatched within <strong className="text-[#292722]">24 to 48 hours</strong> after confirmation. Custom packaging takes a little extra care.</p>
              </div>
              <div className="border border-[#e6e1d9] bg-white p-6">
                <Truck className="text-[#b49a62] mb-3" size={24} />
                <h3 className="font-medium mb-2">Delivery Timeline</h3>
                <p className="text-sm text-[#827b70]">Major cities: <strong className="text-[#292722]">2-4 working days.</strong><br/>Other areas: <strong className="text-[#292722]">4-7 working days.</strong></p>
              </div>
              <div className="border border-[#e6e1d9] bg-white p-6">
                <ShieldCheck className="text-[#b49a62] mb-3" size={24} />
                <h3 className="font-medium mb-2">Order Confirmation</h3>
                <p className="text-sm text-[#827b70]">Our team confirms every order via phone or WhatsApp before dispatch to ensure all details are correct.</p>
              </div>
            </div>
          </div>

          {/* 2. Returns & Exchange */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <RotateCcw className="text-[#b49a62]" size={28} />
              <h2 className="font-serif text-3xl">30 Days Easy Returns</h2>
            </div>
            <div className="bg-[#1d1c1a] text-white p-6 md:p-8 rounded-sm mb-6">
              <p className="text-lg leading-relaxed font-serif">
                "Not in love with your scent? No worries. We offer a hassle-free 30-day return and exchange policy."
              </p>
            </div>
            
            <p className="text-[#827b70] leading-relaxed mb-6">
              We understand that choosing a fragrance online can be tricky. If you are not completely satisfied with your purchase, you can return or exchange it within <strong>30 days</strong> of receiving your order.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#efece6] text-[#b49a62]">
                  <Banknote size={16} />
                </div>
                <div>
                  <h3 className="font-medium text-[#292722]">Money-Back Guarantee</h3>
                  <p className="text-sm text-[#827b70] mt-1">If you prefer a refund, we will process a full money-back transfer to your bank account or EasyPaisa/JazzCash once we receive the returned item.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#efece6] text-[#b49a62]">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <h3 className="font-medium text-[#292722]">Free Replacement</h3>
                  <p className="text-sm text-[#827b70] mt-1">Want a different scent instead? We offer a one-time free replacement. Just send the item back and choose another fragrance from our collection.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Return Conditions */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-[#b49a62]" size={24} />
              <h2 className="font-serif text-2xl">Conditions for Returns</h2>
            </div>
            <p className="text-[#827b70] leading-relaxed mb-4">
              To ensure a smooth return process, please make sure the following conditions are met:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#827b70]">
              <li>The product must be unused and in the same condition that you received it.</li>
              <li>It must be in the original packaging with the seal intact (if applicable).</li>
              <li>You must provide the receipt or proof of purchase (Order Number).</li>
              <li>For damaged or wrong items, please record a short unboxing video as proof to help us resolve it faster.</li>
            </ul>
            <p className="text-[#827b70] leading-relaxed mt-6 text-sm">
              * Please note: Return shipping charges may apply unless the product was delivered damaged or incorrect.
            </p>
          </div>

          {/* 4. Contact for Returns */}
          <div className="bg-white border border-[#e6e1d9] p-8 mt-12">
            <h2 className="font-serif text-2xl mb-4">How to initiate a return?</h2>
            <p className="text-[#827b70] leading-relaxed mb-4">
              Simply contact our support team within 30 days of delivery. Let us know your order number and whether you'd like a refund or a replacement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <a href="mailto:horizonprimeinnit@gmail.com" className="inline-flex items-center justify-center gap-2 bg-[#1d1c1a] px-6 py-3 text-xs uppercase tracking-[.18em] text-white hover:bg-[#b49a62] transition-colors">
                Email Support
              </a>
              <a href="https://wa.me/923028770999" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 border border-[#1d1c1a] px-6 py-3 text-xs uppercase tracking-[.18em] text-[#1d1c1a] hover:bg-[#f8f7f4] transition-colors">
                WhatsApp Us
              </a>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
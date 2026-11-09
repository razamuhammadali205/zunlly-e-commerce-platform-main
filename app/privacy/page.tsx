import Link from 'next/link'
import { ShieldCheck, Lock, Eye, Database, Mail } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292722] pb-24">
      
      {/* Header Section */}
      <section className="px-5 pt-12 pb-16 md:px-8 lg:px-12 max-w-4xl mx-auto border-b border-[#e6e1d9]">
        <Link href="/" className="text-xs uppercase tracking-[.18em] text-[#b49a62] hover:text-[#292722] transition-colors">
          ← Back to ZUNLLY
        </Link>
        
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-4 text-[#b49a62]">
            <ShieldCheck size={28} />
            <span className="text-xs font-semibold uppercase tracking-[.2em]">Your Privacy Matters</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl">Privacy Policy</h1>
          <p className="mt-6 text-lg text-[#827b70] leading-relaxed">
            At ZUNLLY, we understand that your trust is our most valuable asset. This policy explains exactly how we collect, use, and protect your personal information when you shop with us. We keep it simple, transparent, and secure.
          </p>
          <p className="mt-4 text-sm text-[#9b9387]">Last updated: Today</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-5 py-16 md:px-8 lg:px-12 max-w-3xl mx-auto">
        <div className="space-y-12">
          
          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efece6] text-[#b49a62]">
                <Database size={18} />
              </div>
              <h2 className="font-serif text-2xl">1. Information We Collect</h2>
            </div>
            <p className="text-[#827b70] leading-relaxed mb-4">
              When you place an order or create an account, we only ask for the information necessary to get your fragrance to your doorstep:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#827b70]">
              <li><strong className="text-[#292722]">Personal Details:</strong> Your name, email address, and phone number.</li>
              <li><strong className="text-[#292722]">Delivery Information:</strong> Your shipping address and postal code.</li>
              <li><strong className="text-[#292722]">Payment Details:</strong> If you pay in advance, we securely store a screenshot of your transaction. (We never store your bank passwords or card details).</li>
              <li><strong className="text-[#292722]">Technical Data:</strong> Basic browser data to keep your cart saved and improve your shopping experience.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efece6] text-[#b49a62]">
                <Eye size={18} />
              </div>
              <h2 className="font-serif text-2xl">2. How We Use Your Information</h2>
            </div>
            <p className="text-[#827b70] leading-relaxed mb-4">
              We promise to never sell your data to third-party advertisers. Your information is used strictly for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#827b70]">
              <li>Processing and delivering your orders.</li>
              <li>Sending order updates (via SMS, Email, or WhatsApp).</li>
              <li>Providing customer support and resolving any issues.</li>
              <li>Improving our website based on how customers interact with it.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efece6] text-[#b49a62]">
                <Lock size={18} />
              </div>
              <h2 className="font-serif text-2xl">3. How We Protect Your Data</h2>
            </div>
            <p className="text-[#827b70] leading-relaxed">
              We use industry-standard security measures to protect your personal information. Our website is secured with SSL encryption, and all data is stored on secure, world-class cloud servers (Supabase). Access to your data is strictly limited to authorized ZUNLLY team members only.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="font-serif text-2xl mb-4">4. Your Rights</h2>
            <p className="text-[#827b70] leading-relaxed">
              You are in control of your data. At any time, you can contact us to:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-[#827b70]">
              <li>Request a copy of the information we hold about you.</li>
              <li>Ask us to delete your account and personal data (Right to be Forgotten).</li>
              <li>Opt out of promotional emails or messages.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="bg-white border border-[#e6e1d9] p-8 mt-12">
            <div className="flex items-center gap-3 mb-4">
              <Mail size={24} className="text-[#b49a62]" />
              <h2 className="font-serif text-2xl">Have Questions?</h2>
            </div>
            <p className="text-[#827b70] leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, or if you want us to delete your data, please reach out to our support team. We are always happy to help.
            </p>
            <a href="mailto:horizonprimeinnit@gmail.com" className="inline-block border-b border-[#292722] pb-1 font-medium hover:text-[#b49a62] transition-colors">
              horizonprimeinnit@gmail.com
            </a>
          </div>

        </div>
      </section>
    </main>
  )
}
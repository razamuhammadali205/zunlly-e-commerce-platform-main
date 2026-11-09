'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      // ✅ WEB3FORMS API CALL
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY, // .env.local se key aa rahi hai
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          from_name: "ZUNLLY Website",
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitted(true)
        setForm({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        throw new Error(result.message || "Failed to send message.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292722]">
      
      {/* Header Section */}
      <section className="px-5 pt-12 pb-16 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <Link href="/" className="text-xs uppercase tracking-[.18em] text-[#b49a62] hover:text-[#292722] transition-colors">
          ← Back to ZUNLLY
        </Link>
        
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b49a62]">Get in Touch</p>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">We'd love to hear from you.</h1>
          <p className="mt-6 text-lg text-[#827b70]">
            Whether you need help finding your signature scent, have a question about an order, or just want to say hello — our fragrance concierge is here for you.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="px-5 pb-24 md:px-8 lg:px-12 max-w-6xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] items-start">
          
          {/* Left Side: Contact Info */}
          <div className="space-y-6">
            <div className="border border-[#e6e1d9] bg-white p-8">
              <h2 className="font-serif text-2xl mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8f7f4] text-[#b49a62]">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#9b9387] uppercase tracking-wider">Email Us</p>
                    <a href="mailto:horizonprimeinnit@gmail.com" className="mt-1 block text-lg hover:text-[#b49a62] transition-colors break-all">
                      horizonprimeinnit@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8f7f4] text-[#b49a62]">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#9b9387] uppercase tracking-wider">Call Us</p>
                    <a href="tel:03028770999" className="mt-1 block text-lg hover:text-[#b49a62] transition-colors">
                      0302 8770999
                    </a>
                  </div>
                </div>

                {/* WhatsApp Direct */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#9b9387] uppercase tracking-wider">WhatsApp</p>
                    <a href="https://wa.me/923028770999" target="_blank" rel="noreferrer" className="mt-1 block text-lg hover:text-[#25D366] transition-colors">
                      Chat with us
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8f7f4] text-[#b49a62]">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#9b9387] uppercase tracking-wider">Location</p>
                    <p className="mt-1 block text-lg">Karachi, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="border border-[#e6e1d9] bg-[#1d1c1a] p-8 text-white">
              <h3 className="font-serif text-xl mb-2">Concierge Hours</h3>
              <p className="text-sm text-[#9b9387] leading-relaxed">
                Monday – Saturday<br />
                10:00 AM – 8:00 PM (PKT)<br /><br />
                We typically reply within 2-4 business hours.
              </p>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="border border-[#e6e1d9] bg-white p-8 md:p-10">
            <h2 className="font-serif text-2xl mb-2">Send a Message</h2>
            <p className="text-sm text-[#827b70] mb-8">Fill out the form below and we'll get back to you shortly.</p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-500">
                <CheckCircle2 size={48} className="text-green-600 mb-4" />
                <h3 className="font-serif text-2xl">Message Sent!</h3>
                <p className="text-[#827b70] mt-2">Thank you for reaching out. We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#827b70]">Full Name</label>
                    <input 
                      required type="text" 
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full border border-[#e6e1d9] bg-[#f8f7f4] p-3 text-sm outline-none transition-colors focus:border-[#b49a62]" placeholder="Your name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#827b70]">Email Address</label>
                    <input 
                      required type="email" 
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="w-full border border-[#e6e1d9] bg-[#f8f7f4] p-3 text-sm outline-none transition-colors focus:border-[#b49a62]" placeholder="you@example.com" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#827b70]">Subject</label>
                  <input 
                    required type="text" 
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                    className="w-full border border-[#e6e1d9] bg-[#f8f7f4] p-3 text-sm outline-none transition-colors focus:border-[#b49a62]" placeholder="How can we help?" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#827b70]">Message</label>
                  <textarea 
                    required rows={5} 
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    className="w-full border border-[#e6e1d9] bg-[#f8f7f4] p-3 text-sm outline-none transition-colors focus:border-[#b49a62]" placeholder="Write your message here..." 
                  />
                </div>

                {errorMsg && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 bg-[#1d1c1a] px-6 py-4 text-xs font-semibold uppercase tracking-[.18em] text-white transition-all duration-300 hover:bg-[#b49a62] disabled:opacity-50"
                >
                  {loading ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </main>
  )
}
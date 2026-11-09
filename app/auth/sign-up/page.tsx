import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'
export default function SignUpPage() { return <main className="min-h-screen bg-[#fbf7f1] px-5 py-16"><AuthForm mode="signup" /><p className="mx-auto mt-5 max-w-md text-center text-sm text-[#8a6b58]">Already have an account? <Link className="font-semibold text-[#c46c3b]" href="/auth/login">Sign in</Link></p></main> }

import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'
export default function ForgotPasswordPage() { return <main className="min-h-screen bg-[#fbf7f1] px-5 py-16"><AuthForm mode="forgot" /><p className="mx-auto mt-5 max-w-md text-center text-sm text-[#8a6b58]"><Link href="/auth/login">Back to sign in</Link></p></main> }

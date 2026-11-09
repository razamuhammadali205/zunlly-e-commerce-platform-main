import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'
export default function LoginPage() { return <main className="min-h-screen bg-[#fbf7f1] px-5 py-16"><AuthForm mode="login" /><div className="mx-auto mt-5 flex max-w-md justify-between text-sm text-[#8a6b58]"><Link href="/auth/forgot-password">Forgot password?</Link><Link href="/auth/sign-up">Create account</Link></div></main> }

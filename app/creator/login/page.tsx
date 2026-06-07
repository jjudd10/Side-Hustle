'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowserClient'

export default function CreatorLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/creator/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <p className="text-sm uppercase tracking-[0.4em] text-accent-gold">Creator Portal</p>
        <h1 className="mt-4 font-serif text-3xl text-secondary-100">Log in</h1>
        <p className="mt-2 text-sm text-secondary-400">
          Don&apos;t have an account?{' '}
          <Link href="/creator/signup" className="text-accent-gold underline">
            Sign up
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.3em] text-secondary-400">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-2 w-full rounded border border-secondary-800 bg-black/30 px-4 py-3 text-secondary-100 placeholder-secondary-600 focus:border-accent-gold focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.3em] text-secondary-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-2 w-full rounded border border-secondary-800 bg-black/30 px-4 py-3 text-secondary-100 placeholder-secondary-600 focus:border-accent-gold focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-accent-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black shadow-luxury transition hover:bg-accent-bronze disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}

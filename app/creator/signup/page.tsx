'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowserClient'

export default function CreatorSignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ displayName: '', email: '', password: '', bio: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseBrowserClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Sign up failed.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/creator/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: data.user.id,
        display_name: form.displayName,
        bio: form.bio,
      }),
    })

    if (!res.ok) {
      const { error: profileError } = await res.json()
      setError(profileError ?? 'Failed to save profile.')
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-accent-gold">Almost there</p>
          <h1 className="mt-4 font-serif text-3xl text-secondary-100">Check your email</h1>
          <p className="mt-4 text-secondary-400">
            We sent a confirmation link to <span className="text-secondary-100">{form.email}</span>.
            Click it to activate your account, then{' '}
            <Link href="/creator/login" className="text-accent-gold underline">
              log in here
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <p className="text-sm uppercase tracking-[0.4em] text-accent-gold">Creator Portal</p>
        <h1 className="mt-4 font-serif text-3xl text-secondary-100">Create your account</h1>
        <p className="mt-2 text-sm text-secondary-400">
          Already have an account?{' '}
          <Link href="/creator/login" className="text-accent-gold underline">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.3em] text-secondary-400">
              Display Name
            </label>
            <input
              type="text"
              required
              value={form.displayName}
              onChange={e => set('displayName', e.target.value)}
              className="mt-2 w-full rounded border border-secondary-800 bg-black/30 px-4 py-3 text-secondary-100 placeholder-secondary-600 focus:border-accent-gold focus:outline-none"
              placeholder="Your name or studio name"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.3em] text-secondary-400">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => set('email', e.target.value)}
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
              minLength={8}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              className="mt-2 w-full rounded border border-secondary-800 bg-black/30 px-4 py-3 text-secondary-100 placeholder-secondary-600 focus:border-accent-gold focus:outline-none"
              placeholder="8+ characters"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.3em] text-secondary-400">
              Bio <span className="normal-case tracking-normal text-secondary-600">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              className="mt-2 w-full rounded border border-secondary-800 bg-black/30 px-4 py-3 text-secondary-100 placeholder-secondary-600 focus:border-accent-gold focus:outline-none resize-none"
              placeholder="Brief description of your design background"
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
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

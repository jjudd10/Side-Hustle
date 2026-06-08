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
    <div className="cp-page">
      <div className="cp-card">
        <p className="cp-eyebrow">Creator Portal</p>
        <h1 className="cp-title">Log in</h1>
        <p className="cp-subtitle">
          Don&apos;t have an account?{' '}
          <Link href="/creator/signup">Sign up</Link>
        </p>

        <form onSubmit={handleSubmit} className="cp-form">
          <div className="cp-field">
            <label className="cp-label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="cp-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="cp-input"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="cp-error">{error}</p>}

          <button type="submit" disabled={loading} className="cp-btn cp-btn-full">
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}

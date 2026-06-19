'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowserClient'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseBrowserClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Server-side check: verify this is the admin account and get TOTP status
    const res  = await fetch('/api/admin/auth/check')
    const data = await res.json()

    if (!data.isAdmin) {
      await supabase.auth.signOut()
      setError('Unauthorized.')
      setLoading(false)
      return
    }

    router.push(data.hasTOTP ? '/admin/totp-verify' : '/admin/totp-setup')
  }

  return (
    <div className="adm-auth-card">
      <p className="adm-auth-eyebrow">Home in Time</p>
      <h1 className="adm-auth-title">Admin Login</h1>
      <p className="adm-auth-subtitle">Sign in to access the dashboard.</p>

      {error && <div className="adm-auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="adm-auth-field">
          <label className="adm-auth-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="adm-auth-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
            autoFocus
          />
        </div>
        <div className="adm-auth-field">
          <label className="adm-auth-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="adm-auth-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        <button type="submit" className="adm-auth-btn" disabled={loading}>
          {loading ? 'Signing in…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}

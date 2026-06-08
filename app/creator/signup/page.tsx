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
      <div className="cp-page">
        <div className="cp-card" style={{ textAlign: 'center' }}>
          <p className="cp-eyebrow">Almost there</p>
          <h1 className="cp-title">Check your email</h1>
          <p className="cp-subtitle" style={{ marginTop: 16 }}>
            We sent a confirmation link to <strong>{form.email}</strong>.
            Click it to activate your account, then{' '}
            <Link href="/creator/login">log in here</Link>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="cp-page">
      <div className="cp-card">
        <p className="cp-eyebrow">Creator Portal</p>
        <h1 className="cp-title">Create your account</h1>
        <p className="cp-subtitle">
          Already have an account?{' '}
          <Link href="/creator/login">Log in</Link>
        </p>

        <form onSubmit={handleSubmit} className="cp-form">
          <div className="cp-field">
            <label className="cp-label">Display Name</label>
            <input
              type="text"
              required
              value={form.displayName}
              onChange={e => set('displayName', e.target.value)}
              className="cp-input"
              placeholder="Your name or studio name"
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className="cp-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              className="cp-input"
              placeholder="8+ characters"
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">
              Bio <span className="cp-label-opt">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              className="cp-input cp-textarea"
              placeholder="Brief description of your design background"
            />
          </div>

          {error && <p className="cp-error">{error}</p>}

          <button type="submit" disabled={loading} className="cp-btn cp-btn-full">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

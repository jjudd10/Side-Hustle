'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowserClient'

export function TotpVerifyClient() {
  const router = useRouter()
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseBrowserClient()
    const { data: factors, error: factorsErr } = await supabase.auth.mfa.listFactors()

    if (factorsErr || !factors?.totp?.length) {
      setError('No authenticator found. Please sign out and set up TOTP again.')
      setLoading(false)
      return
    }

    const { error: verifyErr } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factors.totp[0].id,
      code,
    })

    if (verifyErr) {
      setError('Invalid code. Check your authenticator and try again.')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="adm-auth-card">
      <p className="adm-auth-eyebrow">Admin Verification</p>
      <h1 className="adm-auth-title">Two-Factor Auth</h1>
      <p className="adm-auth-subtitle">Enter the 6-digit code from your authenticator app.</p>

      {error && <div className="adm-auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="adm-auth-field">
          <label className="adm-auth-label" htmlFor="totp-code">Authenticator Code</label>
          <input
            id="totp-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="adm-auth-input adm-auth-input--code"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
            autoComplete="one-time-code"
            disabled={loading}
            autoFocus
          />
        </div>
        <button type="submit" className="adm-auth-btn" disabled={loading || code.length < 6}>
          {loading ? 'Verifying…' : 'Verify'}
        </button>
      </form>
    </div>
  )
}

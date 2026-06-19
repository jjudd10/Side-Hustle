'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowserClient'

export function TotpSetupClient() {
  const router = useRouter()
  const [factorId, setFactorId]       = useState('')
  const [qrCode, setQrCode]           = useState('')
  const [secret, setSecret]           = useState('')
  const [code, setCode]               = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [enrolling, setEnrolling]     = useState(true)
  const [enrollError, setEnrollError] = useState('')

  useEffect(() => {
    const setup = async () => {
      const supabase = getSupabaseBrowserClient()

      // If already enrolled, skip to verify
      const { data: existing } = await supabase.auth.mfa.listFactors()
      if (existing?.totp?.length) {
        router.replace('/admin/totp-verify')
        return
      }

      const { data, error: enrollErr } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (enrollErr || !data) {
        setEnrollError(enrollErr?.message ?? 'Failed to generate TOTP setup.')
        setEnrolling(false)
        return
      }
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setEnrolling(false)
    }
    setup()
  }, [router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseBrowserClient()
    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeErr || !challenge) {
      setError(challengeErr?.message ?? 'Failed to create challenge.')
      setLoading(false)
      return
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })

    if (verifyErr) {
      setError(verifyErr.message)
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  if (enrolling) {
    return (
      <div className="adm-auth-card" style={{ textAlign: 'center' }}>
        <span className="adm-spinner" />
        <p style={{ color: 'var(--muted)', marginTop: 16, fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
          Setting up authenticator…
        </p>
      </div>
    )
  }

  if (enrollError) {
    return (
      <div className="adm-auth-card">
        <p className="adm-auth-eyebrow">Admin Setup</p>
        <div className="adm-auth-error">{enrollError}</div>
        <button className="adm-auth-btn" onClick={() => router.push('/admin/login')}>
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="adm-auth-card">
      <p className="adm-auth-eyebrow">Admin Setup</p>
      <h1 className="adm-auth-title">Set Up Authenticator</h1>
      <p className="adm-auth-subtitle">
        Scan the QR code with an authenticator app (Google Authenticator, Authy, 1Password, etc.), then enter the 6-digit code to activate.
      </p>

      <div className="adm-auth-qr">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrCode} alt="TOTP QR Code" width={180} height={180} />
      </div>

      <p className="adm-auth-hint" style={{ textAlign: 'center' }}>Can't scan? Enter this secret manually:</p>
      <div className="adm-auth-secret">{secret}</div>

      {error && <div className="adm-auth-error">{error}</div>}

      <form onSubmit={handleVerify}>
        <div className="adm-auth-field">
          <label className="adm-auth-label" htmlFor="setup-code">Verification Code</label>
          <input
            id="setup-code"
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
          {loading ? 'Activating…' : 'Activate Authenticator'}
        </button>
      </form>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowserClient'

type Props = {
  actionLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function TotpConfirmModal({ actionLabel, onConfirm, onCancel }: Props) {
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const verify = async () => {
    setError('')
    setLoading(true)

    const supabase = getSupabaseBrowserClient()
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totpFactor = factors?.totp?.[0]

    if (!totpFactor) {
      setError('No authenticator found. Please sign out and sign in again.')
      setLoading(false)
      return
    }

    const { error: verifyErr } = await supabase.auth.mfa.challengeAndVerify({
      factorId: totpFactor.id,
      code,
    })

    if (verifyErr) {
      setError('Invalid code. Try again.')
      setLoading(false)
      return
    }

    onConfirm()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && code.length === 6 && !loading) verify()
    if (e.key === 'Escape') onCancel()
  }

  return createPortal(
    <div
      className="adm-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="adm-modal">
        <h3 className="adm-modal-title">Confirm Action</h3>
        <p className="adm-modal-sub">
          Enter your authenticator code to {actionLabel}.
        </p>
        <label className="adm-auth-label" htmlFor="totp-modal-code">Authenticator Code</label>
        <input
          id="totp-modal-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="adm-auth-input adm-auth-input--code"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={handleKeyDown}
          placeholder="000000"
          maxLength={6}
          autoFocus
          disabled={loading}
        />
        {error && <p className="adm-modal-error">{error}</p>}
        <div className="adm-modal-actions">
          <button
            className="adm-auth-btn"
            style={{ marginTop: 0, flex: 1 }}
            onClick={verify}
            disabled={loading || code.length < 6}
          >
            {loading ? 'Verifying…' : 'Confirm'}
          </button>
          <button
            className="adm-btn-cancel"
            style={{ flex: 1 }}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

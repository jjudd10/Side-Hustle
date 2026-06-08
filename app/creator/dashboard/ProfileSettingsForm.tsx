'use client'

import { useState } from 'react'

export default function ProfileSettingsForm({
  userId,
  initialDisplayName,
  initialBio,
}: {
  userId: string
  initialDisplayName: string
  initialBio: string
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [bio, setBio] = useState(initialBio)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true)
    setSaved(false)
    setError('')

    const res = await fetch('/api/creator/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, display_name: displayName, bio }),
    })

    setSaving(false)
    if (!res.ok) {
      const { error: e } = await res.json()
      setError(e ?? 'Save failed.')
    } else {
      setSaved(true)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="cp-field">
        <label className="cp-label">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="cp-input"
          placeholder="Your name or studio name"
        />
      </div>
      <div className="cp-field">
        <label className="cp-label">Bio</label>
        <textarea
          rows={4}
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="cp-input cp-textarea"
          placeholder="A short description of your design background"
        />
      </div>

      {error && <p className="cp-error">{error}</p>}
      {saved && <p className="cp-success">Profile saved.</p>}

      <div>
        <button onClick={save} disabled={saving} className="cp-btn">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}

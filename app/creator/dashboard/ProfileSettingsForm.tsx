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
    <div className="space-y-5">
      <div>
        <label className="block text-xs uppercase tracking-[0.3em] text-secondary-400">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="mt-2 w-full rounded border border-secondary-800 bg-black/30 px-4 py-3 text-secondary-100 placeholder-secondary-600 focus:border-accent-gold focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.3em] text-secondary-400">Bio</label>
        <textarea
          rows={4}
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="mt-2 w-full resize-none rounded border border-secondary-800 bg-black/30 px-4 py-3 text-secondary-100 placeholder-secondary-600 focus:border-accent-gold focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-400">Profile saved.</p>}

      <button
        onClick={save}
        disabled={saving}
        className="rounded bg-accent-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.4em] text-black shadow-luxury transition hover:bg-accent-bronze disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
    </div>
  )
}

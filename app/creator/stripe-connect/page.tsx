'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function StripeConnectPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isRefresh = params.get('refresh') === '1'
  const isIncomplete = params.get('incomplete') === '1'

  async function startOnboarding() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/creator/stripe-connect', { method: 'POST' })
    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg">
        <p className="text-sm uppercase tracking-[0.4em] text-accent-gold">Creator Portal</p>
        <h1 className="mt-4 font-serif text-3xl text-secondary-100">Connect Stripe</h1>

        {(isRefresh || isIncomplete) && (
          <div className="mt-6 rounded border border-yellow-700/40 bg-yellow-900/20 px-5 py-4 text-sm text-yellow-300">
            {isIncomplete
              ? 'Your Stripe onboarding wasn\'t completed. Please finish connecting your account to receive payouts.'
              : 'Your onboarding session expired. Please start again.'}
          </div>
        )}

        <p className="mt-6 text-secondary-400 leading-relaxed">
          To receive payouts when customers purchase your plans, you need to connect a Stripe account.
          This takes about 5 minutes and requires your banking details.
        </p>

        <ul className="mt-6 space-y-3 text-sm text-secondary-400">
          {['Receive automatic payouts for each sale', 'Stripe handles all tax reporting (1099-K)', 'Payouts are deposited directly to your bank account'].map(item => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-1 w-6 shrink-0 rounded-full bg-accent-gold" />
              {item}
            </li>
          ))}
        </ul>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-10 flex gap-4">
          <button
            onClick={startOnboarding}
            disabled={loading}
            className="rounded bg-accent-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-black shadow-luxury transition hover:bg-accent-bronze disabled:opacity-50"
          >
            {loading ? 'Redirecting…' : 'Connect Stripe Account'}
          </button>
          <button
            onClick={() => router.push('/creator/dashboard')}
            className="rounded border border-secondary-800 px-6 py-3 text-xs uppercase tracking-[0.4em] text-secondary-400 transition hover:border-secondary-600 hover:text-secondary-200"
          >
            Do this later
          </button>
        </div>
      </div>
    </div>
  )
}

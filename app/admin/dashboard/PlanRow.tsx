'use client'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { TotpConfirmModal } from './TotpConfirmModal'

const BADGE: Record<string, string> = {
  pending:   'adm-badge adm-badge-pending',
  approved:  'adm-badge adm-badge-approved',
  rejected:  'adm-badge adm-badge-rejected',
  suspended: 'adm-badge adm-badge-suspended',
}

export type RowPlan = {
  id: number
  title: string | null
  slug: string
  status: string | null
  price_cents: number | null
  creatorName: string
  sales: number
}

type PendingState = { action: () => Promise<void>; label: string } | null

export function PlanRow({ plan }: { plan: RowPlan }) {
  const router = useRouter()
  const [mode, setMode]           = useState<'view' | 'edit'>('view')
  const [loading, setLoading]     = useState(false)
  const [editTitle, setEditTitle] = useState(plan.title ?? '')
  const [editPrice, setEditPrice] = useState(
    plan.price_cents != null ? String(plan.price_cents / 100) : ''
  )
  const [pending, setPending] = useState<PendingState>(null)

  const displayStatus = plan.status ?? 'approved'

  const requireTotp = useCallback((label: string, action: () => Promise<void>) => {
    setPending({ label, action })
  }, [])

  const suspend = () => requireTotp('suspend this plan', async () => {
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'suspended' }),
    })
    router.refresh()
  })

  const remove = () => requireTotp('remove this plan', async () => {
    await fetch(`/api/admin/plans/${plan.id}`, { method: 'DELETE' })
    router.refresh()
  })

  const apply = () => requireTotp('save these changes', async () => {
    setLoading(true)
    const price_cents = editPrice !== '' ? Math.round(parseFloat(editPrice) * 100) : null
    await Promise.all([
      fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, price_cents }),
      }),
      new Promise(resolve => setTimeout(resolve, 10000)),
    ])
    setMode('view')
    setLoading(false)
    router.refresh()
  })

  const handleConfirm = async () => {
    const saved = pending!
    setPending(null)
    await saved.action()
  }

  const modal = pending ? (
    <TotpConfirmModal
      actionLabel={pending.label}
      onConfirm={handleConfirm}
      onCancel={() => setPending(null)}
    />
  ) : null

  if (mode === 'edit') {
    return (
      <>
        {modal}
        <tr className="adm-row-editing">
          <td>
            <input
              className="adm-edit-input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Plan title"
              disabled={loading}
            />
            <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: 'var(--muted)' }}>
              /plans/{plan.slug}
            </p>
          </td>
          <td style={{ color: 'var(--muted)' }}>{plan.creatorName}</td>
          <td>
            {displayStatus === 'draft'
              ? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>draft</span>
              : <span className={BADGE[displayStatus] ?? 'adm-badge'}>{displayStatus}</span>
            }
          </td>
          <td>
            <div className="adm-price-wrap">
              <span className="adm-price-prefix">$</span>
              <input
                className="adm-edit-input adm-edit-input--price"
                type="number"
                min="0"
                step="1"
                value={editPrice}
                onChange={e => setEditPrice(e.target.value)}
                placeholder="0"
                disabled={loading}
              />
            </div>
          </td>
          <td style={{ color: 'var(--muted)' }}>{plan.sales}</td>
          <td>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="adm-spinner" />
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Saving…</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={apply} className="adm-btn-apply">Apply</button>
                <button onClick={() => setMode('view')} className="adm-btn-cancel">Cancel</button>
              </div>
            )}
          </td>
        </tr>
      </>
    )
  }

  return (
    <>
      {modal}
      <tr>
        <td>
          <p style={{ margin: 0, fontWeight: 500 }}>{plan.title ?? '—'}</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.73rem', color: 'var(--muted)' }}>
            /plans/{plan.slug}
          </p>
        </td>
        <td style={{ color: 'var(--muted)' }}>{plan.creatorName}</td>
        <td>
          {displayStatus === 'draft'
            ? <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.68rem', textTransform: 'capitalize' }}>draft</span>
            : <span className={BADGE[displayStatus] ?? 'adm-badge'}>{displayStatus}</span>
          }
        </td>
        <td style={{ color: 'var(--muted)' }}>
          {plan.price_cents != null ? `$${(plan.price_cents / 100).toLocaleString()}` : '—'}
        </td>
        <td style={{ color: 'var(--muted)' }}>{plan.sales}</td>
        <td>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={suspend} className="adm-btn-suspend">Suspend</button>
            <button onClick={remove}  className="adm-btn-remove">Remove</button>
            <button onClick={() => setMode('edit')} className="adm-btn-edit">Edit</button>
          </div>
        </td>
      </tr>
    </>
  )
}

'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Status = 'approved' | 'rejected' | 'pending'

export function PlanStatusToggle({
  planId,
  currentStatus,
}: {
  planId: number
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const update = async (status: Status) => {
    setLoading(true)
    await fetch(`/api/admin/plans/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
    setLoading(false)
  }

  if (currentStatus === 'approved') {
    return (
      <button onClick={() => update('rejected')} disabled={loading} className="adm-btn-danger">
        {loading ? '…' : 'Reject'}
      </button>
    )
  }

  if (currentStatus === 'rejected') {
    return (
      <button onClick={() => update('approved')} disabled={loading} className="adm-btn-approve">
        {loading ? '…' : 'Approve'}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => update('approved')} disabled={loading} className="adm-btn-approve">
        {loading ? '…' : 'Approve'}
      </button>
      <button onClick={() => update('rejected')} disabled={loading} className="adm-btn-danger">
        {loading ? '…' : 'Reject'}
      </button>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabaseServerClient'
import ProfileSettingsForm from './ProfileSettingsForm'

export const dynamic = 'force-dynamic'

const BADGE: Record<string, string> = {
  pending: 'cp-badge cp-badge-pending',
  approved: 'cp-badge cp-badge-approved',
  rejected: 'cp-badge cp-badge-rejected',
}

export default async function CreatorDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/creator/login')

  const params = await searchParams
  const service = getSupabaseServiceClient()

  const [creatorResult, plansResult] = await Promise.all([
    service.from('creators').select('*').eq('id', user.id).single(),
    service
      .from('floorplan')
      .select('id, title, slug, status, price_cents, created_at')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const creator = creatorResult.data
  const plans = plansResult.data ?? []

  const planIds = plans.map(p => p.id)
  const { data: purchases } = planIds.length
    ? await service.from('purchases').select('plan_id').in('plan_id', planIds)
    : { data: [] }

  const saleCounts: Record<string, number> = {}
  for (const p of purchases ?? []) {
    const key = String(p.plan_id)
    saleCounts[key] = (saleCounts[key] ?? 0) + 1
  }

  const totalSales = Object.values(saleCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="cp-dash">
      {/* Header */}
      <div className="cp-dash-header">
        <div>
          <p className="cp-eyebrow">Creator Portal</p>
          <h1 style={{ margin: '12px 0 0', fontSize: '1.9rem' }}>
            Welcome back{creator?.display_name ? `, ${creator.display_name}` : ''}
          </h1>
        </div>
        <LogoutButton />
      </div>

      {/* Stripe banner */}
      {!creator?.stripe_onboarding_complete && (
        <div className="cp-alert cp-alert-warn">
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Connect Stripe to receive payouts when your plans sell.
          </p>
          <Link href="/creator/stripe-connect" className="cp-btn" style={{ textDecoration: 'none' }}>
            Connect Stripe
          </Link>
        </div>
      )}

      {/* Flash messages */}
      {params.submitted && (
        <div className="cp-alert cp-alert-success">
          Plan submitted — it will go live once reviewed and approved.
        </div>
      )}
      {params.updated && (
        <div className="cp-alert cp-alert-success">
          Plan updated successfully.
        </div>
      )}
      {params.stripe === 'connected' && (
        <div className="cp-alert cp-alert-success">
          Stripe account connected — you&apos;re set up to receive payouts.
        </div>
      )}

      {/* Stats */}
      <div className="cp-stat-grid">
        {[
          { label: 'Plans submitted', value: plans.length },
          { label: 'Plans live', value: plans.filter(p => p.status === 'approved').length },
          { label: 'Total sales', value: totalSales },
        ].map(({ label, value }) => (
          <div key={label} className="cp-stat-card">
            <p className="cp-stat-label">{label}</p>
            <p className="cp-stat-value">{value}</p>
          </div>
        ))}
      </div>

      {/* Plans table */}
      <div style={{ marginTop: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="cp-section-label">Your Plans</p>
          <Link href="/creator/plans/new" className="cp-btn" style={{ textDecoration: 'none' }}>
            + Submit Plan
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="cp-table-wrap">
            <div className="cp-empty">
              <p>You haven&apos;t submitted any plans yet.</p>
              <Link href="/creator/plans/new" style={{ color: 'var(--brand)', fontSize: '0.875rem' }}>
                Submit your first plan →
              </Link>
            </div>
          </div>
        ) : (
          <div className="cp-table-wrap">
            <table className="cp-table">
              <thead>
                <tr>
                  {['Plan', 'Status', 'Price', 'Sales', ''].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => {
                  const sales = saleCounts[String(plan.id)] ?? 0
                  const price = plan.price_cents != null
                    ? `$${(plan.price_cents / 100).toLocaleString()}`
                    : '—'
                  return (
                    <tr key={plan.id}>
                      <td>
                        <p style={{ margin: 0, fontWeight: 500 }}>{plan.title ?? '—'}</p>
                        <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: 'var(--muted)' }}>
                          /plans/{plan.slug}
                        </p>
                      </td>
                      <td>
                        <span className={BADGE[plan.status] ?? 'cp-badge'}>
                          {plan.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{price}</td>
                      <td style={{ color: 'var(--muted)' }}>{sales}</td>
                      <td>
                        <Link
                          href={`/creator/plans/${plan.id}/edit`}
                          style={{ color: 'var(--brand)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile settings */}
      <div style={{ marginTop: 60 }}>
        <p className="cp-section-label">Profile Settings</p>
        <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.55)', border: '1px solid var(--border)', borderRadius: 10, padding: '36px 36px' }}>
          <ProfileSettingsForm
            userId={user.id}
            initialDisplayName={creator?.display_name ?? ''}
            initialBio={creator?.bio ?? ''}
          />
        </div>
      </div>
    </div>
  )
}

function LogoutButton() {
  return (
    <form action="/api/creator/logout" method="POST">
      <button type="submit" className="cp-btn-outline">
        Log Out
      </button>
    </form>
  )
}

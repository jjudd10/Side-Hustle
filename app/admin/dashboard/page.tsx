import '../admin.css'
import Link from 'next/link'
import { getSupabaseServiceClient } from '@/lib/supabaseServerClient'
import { PlanStatusToggle } from './PlanStatusToggle'
import { PlanRow } from './PlanRow'
import { LogoutButton } from './LogoutButton'

export const dynamic = 'force-dynamic'

type AdminPlan = {
  id: number
  title: string | null
  slug: string
  status: string | null
  price_cents: number | null
  created_at: string | null
  creator_id: string | null
  creators: { display_name: string | null } | { display_name: string | null }[] | null
}

type AdminCreator = {
  id: string
  display_name: string | null
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean | null
}

type AdminPurchase = {
  id: number
  customer_email: string | null
  amount_paid: number | null
  created_at: string | null
  plan_id: number | null
}

const BADGE: Record<string, string> = {
  pending:  'adm-badge adm-badge-pending',
  approved: 'adm-badge adm-badge-approved',
  rejected: 'adm-badge adm-badge-rejected',
}

function getCreatorName(
  raw: AdminPlan['creators']
): string {
  if (!raw) return '—'
  if (Array.isArray(raw)) return raw[0]?.display_name ?? '—'
  return raw.display_name ?? '—'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPrice(cents: number | null): string {
  if (cents == null) return '—'
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export default async function AdminDashboard() {
  const service = getSupabaseServiceClient()

  const [plansRes, creatorsRes, purchasesRes] = await Promise.all([
    service
      .from('floorplan')
      .select('id, title, slug, status, price_cents, created_at, creator_id, creators(display_name)')
      .order('created_at', { ascending: false }),
    service
      .from('creators')
      .select('id, display_name, stripe_account_id, stripe_onboarding_complete')
      .order('id', { ascending: true }),
    service
      .from('purchases')
      .select('id, customer_email, amount_paid, created_at, plan_id')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  const plans      = (plansRes.data     ?? []) as AdminPlan[]
  const creators   = (creatorsRes.data  ?? []) as AdminCreator[]
  const purchases  = (purchasesRes.data ?? []) as AdminPurchase[]

  const pendingPlans  = plans.filter(p => p.status === 'pending')
  const approvedPlans = plans.filter(p => p.status === 'approved' || !p.status)
  const totalRevenue  = purchases.reduce((sum, p) => sum + (p.amount_paid ?? 0), 0)

  // Build lookup maps from fetched data to avoid extra queries
  const planTitleMap   = new Map<number, string>()
  const planCreatorMap = new Map<number, string>()
  for (const plan of plans) {
    planTitleMap.set(plan.id, plan.title ?? '—')
    if (plan.creator_id) planCreatorMap.set(plan.id, plan.creator_id)
  }

  const salesPerPlan      = new Map<number, number>()
  const revenuePerCreator = new Map<string, number>()
  for (const purchase of purchases) {
    if (purchase.plan_id != null) {
      salesPerPlan.set(purchase.plan_id, (salesPerPlan.get(purchase.plan_id) ?? 0) + 1)
      const cid = planCreatorMap.get(purchase.plan_id)
      if (cid) {
        revenuePerCreator.set(cid, (revenuePerCreator.get(cid) ?? 0) + (purchase.amount_paid ?? 0))
      }
    }
  }

  const statsPerCreator = new Map<string, { total: number; approved: number; sales: number }>()
  for (const plan of plans) {
    const cid = plan.creator_id ?? ''
    const prev = statsPerCreator.get(cid) ?? { total: 0, approved: 0, sales: 0 }
    prev.total++
    if (plan.status === 'approved' || !plan.status) prev.approved++
    prev.sales += salesPerPlan.get(plan.id) ?? 0
    statsPerCreator.set(cid, prev)
  }

  return (
    <div className="adm-shell">

      {/* Header */}
      <div className="adm-header">
        <div>
          <p className="adm-eyebrow">Home in Time</p>
          <h1 style={{ margin: '10px 0 0', fontSize: '2rem' }}>Admin Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/home" className="adm-btn-outline" style={{ textDecoration: 'none' }}>
            ← Back to Site
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Stats */}
      <div className="adm-stat-grid">
        {([
          { label: 'Total Plans',    value: plans.length },
          { label: 'Pending Review', value: pendingPlans.length,  highlight: pendingPlans.length > 0 },
          { label: 'Live Plans',     value: approvedPlans.length },
          { label: 'Creators',       value: creators.length },
          { label: 'Total Sales',    value: purchases.length },
          { label: 'Revenue',        value: formatPrice(totalRevenue) },
        ] as { label: string; value: number | string; highlight?: boolean }[]).map(({ label, value, highlight }) => (
          <div key={label} className={`adm-stat-card${highlight ? ' adm-stat-card--alert' : ''}`}>
            <p className="adm-stat-label">{label}</p>
            <p className="adm-stat-value">{value}</p>
          </div>
        ))}
      </div>

      {/* Pending Review — only shown when there is work to do */}
      {pendingPlans.length > 0 && (
        <section className="adm-section">
          <p className="adm-section-label">
            Pending Review
            <span className="adm-count">{pendingPlans.length}</span>
          </p>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  {['Plan', 'Creator', 'Price', 'Submitted', 'Action'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingPlans.map(plan => (
                  <tr key={plan.id}>
                    <td>
                      <p style={{ margin: 0, fontWeight: 500 }}>{plan.title ?? '—'}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.73rem', color: 'var(--muted)' }}>
                        /plans/{plan.slug}
                      </p>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{getCreatorName(plan.creators)}</td>
                    <td style={{ color: 'var(--muted)' }}>{formatPrice(plan.price_cents)}</td>
                    <td style={{ color: 'var(--muted)' }}>{formatDate(plan.created_at)}</td>
                    <td>
                      <PlanStatusToggle planId={plan.id} currentStatus="pending" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* All Plans */}
      <section className="adm-section">
        <p className="adm-section-label">
          All Plans
          <span className="adm-count">{plans.length}</span>
        </p>
        <div className="adm-table-wrap">
          {plans.length === 0 ? (
            <div className="adm-empty">No plans submitted yet.</div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  {['Plan', 'Creator', 'Status', 'Price', 'Sales', 'Action'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <PlanRow
                    key={plan.id}
                    plan={{
                      id:           plan.id,
                      title:        plan.title,
                      slug:         plan.slug,
                      status:       plan.status,
                      price_cents:  plan.price_cents,
                      creatorName:  getCreatorName(plan.creators),
                      sales:        salesPerPlan.get(plan.id) ?? 0,
                    }}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Creators */}
      <section className="adm-section">
        <p className="adm-section-label">
          Creators
          <span className="adm-count">{creators.length}</span>
        </p>
        <div className="adm-table-wrap">
          {creators.length === 0 ? (
            <div className="adm-empty">No creators have signed up yet.</div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  {['Name', 'Stripe', 'Plans', 'Live', 'Sales', 'Revenue'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {creators.map(creator => {
                  const stats   = statsPerCreator.get(creator.id) ?? { total: 0, approved: 0, sales: 0 }
                  const revenue = revenuePerCreator.get(creator.id) ?? 0
                  return (
                    <tr key={creator.id}>
                      <td style={{ fontWeight: 500 }}>{creator.display_name ?? '—'}</td>
                      <td>
                        {creator.stripe_onboarding_complete
                          ? <span className="adm-badge adm-badge-approved">Connected</span>
                          : <span className="adm-badge adm-badge-pending">Pending</span>
                        }
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{stats.total}</td>
                      <td style={{ color: 'var(--muted)' }}>{stats.approved}</td>
                      <td style={{ color: 'var(--muted)' }}>{stats.sales}</td>
                      <td style={{ color: 'var(--muted)' }}>{formatPrice(revenue)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Recent Purchases */}
      <section className="adm-section">
        <p className="adm-section-label">
          Recent Purchases
          <span className="adm-count">{purchases.length}</span>
        </p>
        <div className="adm-table-wrap">
          {purchases.length === 0 ? (
            <div className="adm-empty">No purchases yet.</div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  {['Plan', 'Customer', 'Amount', 'Date'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td style={{ fontWeight: 500 }}>
                      {purchase.plan_id ? (planTitleMap.get(purchase.plan_id) ?? '—') : '—'}
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{purchase.customer_email ?? '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{formatPrice(purchase.amount_paid)}</td>
                    <td style={{ color: 'var(--muted)' }}>{formatDate(purchase.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

    </div>
  )
}

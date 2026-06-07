import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabaseServerClient'
import ProfileSettingsForm from './ProfileSettingsForm'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
  approved: 'bg-green-900/30 text-green-400 border-green-700/40',
  rejected: 'bg-red-900/30 text-red-400 border-red-700/40',
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

  // Fetch creator profile, plans, and sales in parallel
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

  // Fetch sale counts for each plan
  const planIds = plans.map(p => p.id)
  const { data: purchases } = planIds.length
    ? await service
        .from('purchases')
        .select('plan_id')
        .in('plan_id', planIds)
    : { data: [] }

  const saleCounts: Record<string, number> = {}
  for (const p of purchases ?? []) {
    const key = String(p.plan_id)
    saleCounts[key] = (saleCounts[key] ?? 0) + 1
  }

  const totalSales = Object.values(saleCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-accent-gold">Creator Portal</p>
          <h1 className="mt-2 font-serif text-3xl text-secondary-100">
            Welcome back{creator?.display_name ? `, ${creator.display_name}` : ''}
          </h1>
        </div>
        <LogoutButton />
      </div>

      {/* Stripe Connect banner */}
      {!creator?.stripe_onboarding_complete && (
        <div className="mt-8 flex items-center justify-between rounded border border-yellow-700/40 bg-yellow-900/20 px-5 py-4">
          <p className="text-sm text-yellow-300">
            Connect Stripe to receive payouts when your plans sell.
          </p>
          <Link
            href="/creator/stripe-connect"
            className="ml-4 shrink-0 rounded bg-accent-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black hover:bg-accent-bronze"
          >
            Connect Stripe
          </Link>
        </div>
      )}

      {/* Flash messages */}
      {params.submitted && (
        <div className="mt-6 rounded border border-green-700/40 bg-green-900/20 px-5 py-3 text-sm text-green-400">
          Plan submitted — it will go live once reviewed and approved.
        </div>
      )}
      {params.updated && (
        <div className="mt-6 rounded border border-green-700/40 bg-green-900/20 px-5 py-3 text-sm text-green-400">
          Plan updated successfully.
        </div>
      )}
      {params.stripe === 'connected' && (
        <div className="mt-6 rounded border border-green-700/40 bg-green-900/20 px-5 py-3 text-sm text-green-400">
          Stripe account connected — you&apos;re set up to receive payouts.
        </div>
      )}

      {/* Stats row */}
      <div className="mt-10 grid grid-cols-3 gap-4">
        {[
          { label: 'Plans submitted', value: plans.length },
          { label: 'Plans live', value: plans.filter(p => p.status === 'approved').length },
          { label: 'Total sales', value: totalSales },
        ].map(({ label, value }) => (
          <div key={label} className="rounded border border-secondary-800/60 bg-black/30 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.3em] text-secondary-600">{label}</p>
            <p className="mt-2 font-serif text-3xl text-secondary-100">{value}</p>
          </div>
        ))}
      </div>

      {/* Plans table */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-[0.4em] text-secondary-400">Your Plans</h2>
          <Link
            href="/creator/plans/new"
            className="rounded bg-accent-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-luxury hover:bg-accent-bronze"
          >
            + Submit Plan
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="mt-6 rounded border border-secondary-800/60 bg-black/30 px-8 py-12 text-center">
            <p className="text-secondary-400">You haven&apos;t submitted any plans yet.</p>
            <Link href="/creator/plans/new" className="mt-4 inline-block text-sm text-accent-gold underline">
              Submit your first plan
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded border border-secondary-800/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-800/60 bg-black/20">
                  {['Plan', 'Status', 'Price', 'Sales', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs uppercase tracking-[0.3em] text-secondary-600">
                      {h}
                    </th>
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
                    <tr key={plan.id} className="border-b border-secondary-800/40 last:border-0 hover:bg-white/5">
                      <td className="px-5 py-4">
                        <p className="text-secondary-100">{plan.title ?? '—'}</p>
                        <p className="text-xs text-secondary-600">/plans/{plan.slug}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded border px-2.5 py-0.5 text-xs capitalize ${STATUS_STYLES[plan.status] ?? ''}`}>
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-secondary-300">{price}</td>
                      <td className="px-5 py-4 text-secondary-300">{sales}</td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/creator/plans/${plan.id}/edit`}
                          className="text-xs uppercase tracking-widest text-accent-gold hover:text-accent-bronze"
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
      <div className="mt-16">
        <h2 className="text-sm uppercase tracking-[0.4em] text-secondary-400">Profile Settings</h2>
        <div className="mt-4 rounded border border-secondary-800/60 bg-black/30 p-8">
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
      <button
        type="submit"
        className="rounded border border-secondary-800 px-4 py-2 text-xs uppercase tracking-[0.3em] text-secondary-600 hover:border-secondary-600 hover:text-secondary-400"
      >
        Log Out
      </button>
    </form>
  )
}

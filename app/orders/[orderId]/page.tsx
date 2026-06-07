import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseServiceClient } from '@/lib/supabaseServerClient'
import { generateSignedDownloadUrl, PRIVATE_BUCKET } from '@/lib/r2Client'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ orderId: string }> }

export default async function OrderPage({ params }: Props) {
  const { orderId } = await params
  const service = getSupabaseServiceClient()

  const { data: purchase } = await service
    .from('purchases')
    .select('id, customer_email, purchased_at, amount_paid, floorplan(title, file_paths)')
    .eq('id', orderId)
    .single()

  if (!purchase) notFound()

  const plan = purchase.floorplan as any
  const filePaths: Record<string, string> = plan?.file_paths ?? {}

  const downloadLinks = await Promise.all(
    Object.entries(filePaths).map(async ([type, key]) => {
      const url = await generateSignedDownloadUrl(PRIVATE_BUCKET(), key, 3600)
      return { label: type.toUpperCase(), url }
    })
  )

  const purchasedAt = new Date(purchase.purchased_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const amountDisplay = purchase.amount_paid
    ? `$${(purchase.amount_paid / 100).toFixed(2)}`
    : null

  return (
    <div className="min-h-screen bg-[#1a1008] px-6 py-20">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-xs uppercase tracking-[0.3em] text-secondary-600 hover:text-secondary-400">
          ← Home
        </Link>

        <p className="mt-8 text-sm uppercase tracking-[0.4em] text-accent-gold">Order Confirmation</p>
        <h1 className="mt-4 font-serif text-3xl text-secondary-100">
          {plan?.title ?? 'Your Floor Plan'}
        </h1>

        <div className="mt-2 flex flex-wrap gap-6 text-xs text-secondary-600">
          <span>Purchased {purchasedAt}</span>
          {amountDisplay && <span>{amountDisplay}</span>}
          <span>{purchase.customer_email}</span>
        </div>

        <div className="mt-10 rounded border border-secondary-800/60 bg-black/30 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary-400">Your Files</p>
          <p className="mt-2 text-xs text-secondary-600">
            Download links expire in 1 hour. Refresh this page to generate new links.
          </p>

          {downloadLinks.length === 0 ? (
            <p className="mt-6 text-sm text-secondary-400">
              No files are attached to this order yet. Contact support if you believe this is an error.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {downloadLinks.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  download
                  className="flex items-center justify-between rounded border border-secondary-800 px-5 py-4 text-sm text-secondary-100 transition hover:border-accent-gold hover:text-accent-gold"
                >
                  <span>{label} Floor Plan</span>
                  <span className="text-xs uppercase tracking-widest text-accent-gold">Download →</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-secondary-600">
          Order ID: {orderId}
        </p>
      </div>
    </div>
  )
}

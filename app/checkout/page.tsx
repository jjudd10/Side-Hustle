import { redirect } from 'next/navigation'
import CheckoutForm from './CheckoutForm'
import './checkout.css'

type CheckoutPageProps = {
  searchParams: Promise<{
    clientSecret?: string
    amount?: string
    planTitle?: string
  }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { clientSecret, amount, planTitle } = await searchParams

  if (!clientSecret || !amount || !planTitle) {
    redirect('/')
  }

  const amountNum = parseFloat(amount)
  if (isNaN(amountNum)) {
    redirect('/')
  }

  return (
    <main className="checkout-shell">
      <div className="checkout-container">
        <h1 className="checkout-heading">Complete Your Purchase</h1>
        <CheckoutForm
          amount={amountNum}
          clientSecret={clientSecret}
          planTitle={decodeURIComponent(planTitle)}
        />
      </div>
    </main>
  )
}

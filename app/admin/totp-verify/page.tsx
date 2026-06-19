import '../admin.css'
import { TotpVerifyClient } from './TotpVerifyClient'

export const dynamic = 'force-dynamic'

export default function TotpVerifyPage() {
  return (
    <div className="adm-auth-shell">
      <TotpVerifyClient />
    </div>
  )
}

import '../admin.css'
import { TotpSetupClient } from './TotpSetupClient'

export const dynamic = 'force-dynamic'

export default function TotpSetupPage() {
  return (
    <div className="adm-auth-shell">
      <TotpSetupClient />
    </div>
  )
}

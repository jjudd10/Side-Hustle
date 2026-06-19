import '../admin.css'
import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <div className="adm-auth-shell">
      <LoginForm />
    </div>
  )
}

'use client'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowserClient'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="adm-btn-logout">
      Sign Out
    </button>
  )
}

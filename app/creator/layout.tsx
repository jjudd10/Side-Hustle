import type { ReactNode } from 'react'
import './creator.css'

export const metadata = {
  title: 'Creator Portal',
}

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

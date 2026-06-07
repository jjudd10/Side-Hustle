import type { ReactNode } from 'react'

export const metadata = {
  title: 'Creator Portal',
}

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a1008]">
      {children}
    </div>
  )
}

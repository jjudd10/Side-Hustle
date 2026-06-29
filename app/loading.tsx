'use client'
import { useEffect } from 'react'

// Signals the layout-level NavigationLoader that a Suspense boundary is active.
// The NavigationLoader owns the actual animation and all timing logic, so the
// animation can complete its full cycle even after this component unmounts.
export default function Loading() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('app:loading'))
    return () => { window.dispatchEvent(new CustomEvent('app:loaded')) }
  }, [])
  return null
}

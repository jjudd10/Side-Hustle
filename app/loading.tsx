import './loading.css'
import LogoTraceLoader from './components/LogoTraceLoader'

// Next.js treats this file as the Suspense fallback for the entire app.
// It renders automatically while any Server Component in a route is fetching
// data, then is replaced by the real page once loading is complete.
export default function Loading() {
  return <LogoTraceLoader />
}

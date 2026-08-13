'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Skip admin and api routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return

    // Fire and forget — no await needed
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {}) // Silently fail
  }, [pathname])

  return null
}

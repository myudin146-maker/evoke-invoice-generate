'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useInvoiceStore } from '@/store/invoiceStore'

export default function HydrationGuard({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Hydrate Zustand store dari localStorage setelah mount
    useInvoiceStore.persist.rehydrate()
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <>{children}</>
}

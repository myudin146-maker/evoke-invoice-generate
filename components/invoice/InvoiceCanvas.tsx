'use client'

import { useEffect, useRef } from 'react'
import { useInvoiceStore } from '@/store/invoiceStore'
import CompanyTemplate from './templates/CompanyTemplate'
import SimpleTemplate from './templates/SimpleTemplate'

export default function InvoiceCanvas() {
  const template = useInvoiceStore((s) => s.invoice.template)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Responsive scale: shrink canvas agar fit di layar kecil
  useEffect(() => {
    const scale = () => {
      if (!wrapperRef.current || !canvasRef.current) return
      const wrapperWidth = wrapperRef.current.offsetWidth
      const canvasWidth = 794
      if (wrapperWidth < canvasWidth) {
        const ratio = wrapperWidth / canvasWidth
        canvasRef.current.style.transform = `scale(${ratio})`
        canvasRef.current.style.transformOrigin = 'top left'
        wrapperRef.current.style.height = `${1123 * ratio}px`
      } else {
        canvasRef.current.style.transform = 'none'
        wrapperRef.current.style.height = 'auto'
      }
    }

    scale()
    window.addEventListener('resize', scale)
    return () => window.removeEventListener('resize', scale)
  }, [])

  return (
    <div ref={wrapperRef} className="w-full">
      <div
        ref={canvasRef}
        id="invoice-canvas"
        className="bg-white shadow-xl rounded-2xl"
        style={{ width: '794px', minHeight: '1123px' }}
      >
        {template === 'company' ? <CompanyTemplate /> : <SimpleTemplate />}
      </div>
    </div>
  )
}

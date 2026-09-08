'use client'

import { useEffect, useRef } from 'react'
import { useInvoiceStore } from '@/store/invoiceStore'
import CompanyTemplate from './templates/CompanyTemplate'
import SimpleTemplate from './templates/SimpleTemplate'

export default function InvoiceCanvas() {
  const template = useInvoiceStore((s) => s.invoice.template)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const CANVAS_WIDTH = 794

    const applyScale = () => {
      if (!wrapperRef.current || !canvasRef.current) return
      const wrapperWidth = wrapperRef.current.offsetWidth

      if (wrapperWidth < CANVAS_WIDTH) {
        const ratio = wrapperWidth / CANVAS_WIDTH
        canvasRef.current.style.transform = `scale(${ratio})`
        canvasRef.current.style.transformOrigin = 'top left'
        // Adjust wrapper height agar tidak ada blank space
        wrapperRef.current.style.height = `${1123 * ratio}px`
      } else {
        canvasRef.current.style.transform = 'none'
        canvasRef.current.style.transformOrigin = 'unset'
        wrapperRef.current.style.height = 'auto'
      }
    }

    applyScale()
    window.addEventListener('resize', applyScale)

    // Saat print dimulai: reset transform agar A4 konsisten
    const beforePrint = () => {
      if (canvasRef.current) {
        canvasRef.current.style.transform = 'none'
        canvasRef.current.style.transformOrigin = 'unset'
      }
      if (wrapperRef.current) {
        wrapperRef.current.style.height = 'auto'
      }
    }

    // Setelah print selesai: kembalikan scaling
    const afterPrint = () => {
      applyScale()
    }

    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)

    return () => {
      window.removeEventListener('resize', applyScale)
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
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

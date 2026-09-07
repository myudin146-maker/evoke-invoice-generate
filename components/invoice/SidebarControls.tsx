'use client'

import { useRef, useState } from 'react'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useAuth } from '@/context/AuthContext'
import { saveInvoice, uploadLogo } from '@/lib/invoiceService'
import { formatCurrency } from '@/lib/utils'
import Button from '../ui/Button'
import {
  Download, Save, RotateCcw, Upload, Palette, LayoutTemplate, DollarSign
} from 'lucide-react'

export default function SidebarControls() {
  const {
    invoice, updateInvoice, resetInvoice,
    getSubtotal, getTaxAmount, getDiscountAmount, getTotal
  } = useInvoiceStore()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const subtotal = getSubtotal()
  const taxAmount = getTaxAmount()
  const discountAmount = getDiscountAmount()
  const total = getTotal()

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const result = await saveInvoice(
      invoice, subtotal, taxAmount, discountAmount, total, user.id
    )
    setSaving(false)
    if (result) {
      setSaveMsg('Tersimpan!')
      setTimeout(() => setSaveMsg(''), 2000)
    }
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')

      const element = document.getElementById('invoice-canvas')
      if (!element) return

      // Sembunyikan elemen no-print sementara
      const noPrintEls = element.querySelectorAll<HTMLElement>('.no-print')
      noPrintEls.forEach((el) => { el.style.display = 'none' })

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc, clonedEl) => {
          // Hapus SEMUA stylesheet dari dokumen clone
          // agar tidak ada oklch/lab yang dibaca
          const allStyles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]')
          allStyles.forEach((s) => s.remove())

          // Inject ulang hanya style minimal berbasis hex
          const style = clonedDoc.createElement('style')
          style.textContent = `
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #111827; }
            .no-print { display: none !important; }
            table { width: 100%; border-collapse: collapse; }
            .text-indigo-600 { color: #4f46e5; }
            .text-indigo-700 { color: #4338ca; }
            .text-gray-900 { color: #111827; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-700 { color: #374151; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-400 { color: #9ca3af; }
            .text-green-600 { color: #16a34a; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .font-extrabold { font-weight: 800; }
            .text-4xl { font-size: 2.25rem; line-height: 1; }
            .text-3xl { font-size: 1.875rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-xl { font-size: 1.25rem; }
            .text-base { font-size: 1rem; }
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .tracking-tight { letter-spacing: -0.025em; }
            .tracking-widest { letter-spacing: 0.1em; }
            .uppercase { text-transform: uppercase; }
            .leading-relaxed { line-height: 1.625; }
            .border-t-2 { border-top: 2px solid #4f46e5; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .border-b { border-bottom: 1px solid #f3f4f6; }
            .border-b-2 { border-bottom: 2px solid #e5e7eb; }
            .border-gray-100 { border-color: #f3f4f6; }
            .border-gray-200 { border-color: #e5e7eb; }
            .border-gray-300 { border-color: #d1d5db; }
            .bg-white { background-color: #ffffff; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-indigo-100 { background-color: #e0e7ff; }
            .p-10 { padding: 2.5rem; }
            .pt-6 { padding-top: 1.5rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            .mt-10 { margin-top: 2.5rem; }
            .mt-6 { margin-top: 1.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mb-10 { margin-bottom: 2.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-8 { gap: 2rem; }
            .gap-6 { gap: 1.5rem; }
            .gap-4 { gap: 1rem; }
            .flex { display: flex; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .w-full { width: 100%; }
            .w-72 { width: 18rem; }
            .w-40 { width: 10rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .rounded-xl { border-radius: 0.75rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .h-16 { height: 4rem; }
            .w-16 { width: 4rem; }
            .flex-shrink-0 { flex-shrink: 0; }
            .flex-1 { flex: 1 1 0%; }
            .min-w-0 { min-width: 0; }
            .overflow-hidden { overflow: hidden; }
            .whitespace-pre-wrap { white-space: pre-wrap; }
            .block { display: block; }
          `
          clonedDoc.head.appendChild(style)
          clonedEl.style.cssText = 'background:#fff;color:#111827;font-family:Arial,Helvetica,sans-serif;'
        },
      })

      // Restore elemen no-print
      noPrintEls.forEach((el) => { el.style.display = '' })

      // Buat PDF dari canvas image langsung tanpa jsPDF parsing CSS
      const imgData = canvas.toDataURL('image/png')
      const { default: jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })

      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pageW) / canvas.width

      let remaining = imgH
      let yPos = 0

      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, yPos, pageW, imgH)
        remaining -= pageH
        if (remaining > 0) {
          pdf.addPage()
          yPos -= pageH
        }
      }

      pdf.save(`${invoice.invoice_number}.pdf`)
    } catch (e) {
      console.error('PDF error:', e)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (user) {
      const url = await uploadLogo(file, user.id)
      if (url) updateInvoice({ logo_url: url })
    } else {
      const reader = new FileReader()
      reader.onload = (ev) => {
        updateInvoice({ logo_url: ev.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="no-print flex flex-col gap-4">
      {/* Template */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <LayoutTemplate className="w-3.5 h-3.5" /> Template
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(['company', 'simple'] as const).map((t) => (
            <button
              key={t}
              onClick={() => updateInvoice({ template: t })}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition ${
                invoice.template === t
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {t === 'company' ? '🏢 Company' : '✨ Simple'}
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5" /> Mata Uang
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(['IDR', 'USD'] as const).map((c) => (
            <button
              key={c}
              onClick={() => updateInvoice({ currency: c })}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition ${
                invoice.currency === c
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {c === 'IDR' ? '🇮🇩 IDR' : '🇺🇸 USD'}
            </button>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" /> Logo Perusahaan
        </p>
        {invoice.logo_url && (
          <div className="mb-3 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={invoice.logo_url} alt="Logo" className="h-10 w-auto object-contain rounded border border-gray-100" />
            <button
              onClick={() => updateInvoice({ logo_url: null })}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Hapus
            </button>
          </div>
        )}
        <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleLogoUpload} />
        <Button variant="secondary" size="sm" className="w-full" onClick={() => fileRef.current?.click()}>
          <Upload className="w-3.5 h-3.5" /> Upload Logo
        </Button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Ringkasan
        </p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, invoice.currency)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Pajak ({invoice.tax_type === 'percent' ? `${invoice.tax_rate}%` : 'nominal'})</span>
            <span>+{formatCurrency(taxAmount, invoice.currency)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon</span>
              <span>-{formatCurrency(discountAmount, invoice.currency)}</span>
            </div>
          )}
          {(Number(invoice.shipping) > 0) && (
            <div className="flex justify-between text-gray-600">
              <span>Pengiriman</span>
              <span>+{formatCurrency(Number(invoice.shipping), invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span className="text-indigo-600">{formatCurrency(total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          variant="primary"
          size="md"
          className="w-full"
          loading={downloading}
          onClick={handleDownloadPDF}
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={handlePrint}
        >
          🖨️ Cetak
        </Button>
        {user && (
          <Button
            variant="outline"
            size="md"
            className="w-full"
            loading={saving}
            onClick={handleSave}
          >
            <Save className="w-4 h-4" />
            {saveMsg || 'Simpan ke Cloud'}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-gray-400"
          onClick={resetInvoice}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Invoice
        </Button>
      </div>

      {!user && (
        <p className="text-xs text-gray-400 text-center">
          Masuk untuk menyimpan invoice ke cloud ☁️
        </p>
      )}
    </div>
  )
}

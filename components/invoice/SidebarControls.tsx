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
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('invoice-canvas')
      if (!element) return
      const opt = {
        margin: [10, 10] as [number, number],
        filename: `${invoice.invoice_number}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } as any,
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }
      await html2pdf().set(opt).from(element).save()
    } catch (e) {
      console.error(e)
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
      // Guest: use base64
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

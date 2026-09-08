'use client'

import { useState } from 'react'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useAuth } from '@/context/AuthContext'
import { saveInvoice } from '@/lib/invoiceService'
import { formatCurrency } from '@/lib/utils'

export default function MobileBottomBar() {
  const { invoice, getSubtotal, getTaxAmount, getDiscountAmount, getTotal, currentInvoiceId, setCurrentInvoiceId } = useInvoiceStore()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const subtotal = getSubtotal()
    const tax = getTaxAmount()
    const disc = getDiscountAmount()
    const total = getTotal()
    const result = await saveInvoice(invoice, subtotal, tax, disc, total, user.id, currentInvoiceId || undefined)
    setSaving(false)
    if (result) {
      if (!currentInvoiceId) setCurrentInvoiceId(result.id)
      setSaveMsg('✅ Tersimpan!')
      setTimeout(() => setSaveMsg(''), 2000)
    }
  }

  return (
    <div className="lg:hidden no-print fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
      {/* Total bar */}
      <div className="px-4 pt-2 pb-1 flex justify-between items-center text-sm">
        <span className="text-gray-500">Total</span>
        <span className="font-bold text-blue-600">{formatCurrency(getTotal(), invoice.currency)}</span>
      </div>
      {/* Action buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => window.print()}
          className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium"
        >
          🖨️ Print / PDF
        </button>
        {user && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 border border-blue-600 text-blue-600 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {saving ? '...' : saveMsg || '☁️ Simpan'}
          </button>
        )}
      </div>
    </div>
  )
}

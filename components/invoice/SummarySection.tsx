'use client'

import { useInvoiceStore } from '@/store/invoiceStore'
import { formatCurrency } from '@/lib/utils'

export default function SummarySection() {
  const {
    invoice, updateInvoice,
    getSubtotal, getTaxAmount, getDiscountAmount, getTotal
  } = useInvoiceStore()

  const subtotal = getSubtotal()
  const taxAmount = getTaxAmount()
  const discountAmount = getDiscountAmount()
  const total = getTotal()

  return (
    <div className="flex justify-end mt-6">
      <div className="w-72 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal, invoice.currency)}</span>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <span>Pajak</span>
            <select
              value={invoice.tax_type}
              onChange={(e) => updateInvoice({ tax_type: e.target.value as 'percent' | 'fixed' })}
              className="no-print text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
            >
              <option value="percent">%</option>
              <option value="fixed">nominal</option>
            </select>
            <input
              type="text"
              inputMode="decimal"
              value={invoice.tax_rate === 0 ? '' : invoice.tax_rate}
              onChange={(e) => {
                const v = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0
                updateInvoice({ tax_rate: v })
              }}
              className="no-print w-14 text-xs border border-gray-200 rounded px-1.5 py-0.5 text-right"
              placeholder="0"
            />
          </div>
          <span className="font-medium">+{formatCurrency(taxAmount, invoice.currency)}</span>
        </div>

        {/* Discount */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <span>Diskon</span>
            <select
              value={invoice.discount_type}
              onChange={(e) => updateInvoice({ discount_type: e.target.value as 'percent' | 'fixed' })}
              className="no-print text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
            >
              <option value="percent">%</option>
              <option value="fixed">nominal</option>
            </select>
            <input
              type="text"
              inputMode="decimal"
              value={invoice.discount === 0 ? '' : invoice.discount}
              onChange={(e) => {
                const v = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0
                updateInvoice({ discount: v })
              }}
              className="no-print w-14 text-xs border border-gray-200 rounded px-1.5 py-0.5 text-right"
              placeholder="0"
            />
          </div>
          <span className="font-medium text-green-600">
            {discountAmount > 0 ? `-${formatCurrency(discountAmount, invoice.currency)}` : '-'}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Pengiriman</span>
          <input
            type="text"
            inputMode="decimal"
            value={invoice.shipping === 0 ? '' : invoice.shipping}
            onChange={(e) => {
              const v = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0
              updateInvoice({ shipping: v })
            }}
            className="no-print w-24 text-xs border border-gray-200 rounded px-1.5 py-0.5 text-right"
            placeholder="0"
          />
        </div>

        {/* Total */}
        <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t-2 border-gray-200">
          <span>TOTAL</span>
          <span className="text-indigo-700">{formatCurrency(total, invoice.currency)}</span>
        </div>
      </div>
    </div>
  )
}

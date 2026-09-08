'use client'

import { useInvoiceStore } from '@/store/invoiceStore'
import { formatCurrency, formatNumberInput, parseNumberInput } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function ItemsTable() {
  const { invoice, updateItem, addItem, removeItem } = useInvoiceStore()
  const { items, currency } = invoice

  // Track input string per-field agar user bisa mengetik bebas
  const [inputValues, setInputValues] = useState<Record<string, { qty?: string; price?: string }>>({})

  const getQtyDisplay = (item: { id: string; quantity: number }) => {
    return inputValues[item.id]?.qty ?? (item.quantity === 0 ? '' : String(item.quantity))
  }

  const getPriceDisplay = (item: { id: string; unit_price: number }) => {
    return inputValues[item.id]?.price ?? formatNumberInput(item.unit_price)
  }

  const handleQtyChange = (id: string, raw: string) => {
    // Hanya angka dan titik desimal
    const cleaned = raw.replace(/[^0-9.]/g, '')
    setInputValues((prev) => ({ ...prev, [id]: { ...prev[id], qty: cleaned } }))
    const val = parseFloat(cleaned) || 0
    updateItem(id, { quantity: val })
  }

  const handleQtyBlur = (id: string) => {
    setInputValues((prev) => ({ ...prev, [id]: { ...prev[id], qty: undefined } }))
  }

  const handlePriceChange = (id: string, raw: string) => {
    // Hapus titik ribuan agar user bisa ketik angka biasa atau dengan titik
    const withoutThousands = raw.replace(/\./g, '')
    // Hanya angka
    const cleaned = withoutThousands.replace(/[^0-9]/g, '')
    // Format ulang dengan titik ribuan
    const num = parseInt(cleaned) || 0
    const formatted = num === 0 ? '' : new Intl.NumberFormat('id-ID').format(num)
    setInputValues((prev) => ({ ...prev, [id]: { ...prev[id], price: formatted } }))
    updateItem(id, { unit_price: num })
  }

  const handlePriceBlur = (id: string, unit_price: number) => {
    const formatted = formatNumberInput(unit_price)
    setInputValues((prev) => ({ ...prev, [id]: { ...prev[id], price: formatted } }))
  }

  return (
    <div className="mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left py-2.5 px-3 font-semibold text-gray-600 rounded-tl-lg">Item</th>
            <th className="text-right py-2.5 px-3 font-semibold text-gray-600 w-20">Qty</th>
            <th className="text-right py-2.5 px-3 font-semibold text-gray-600 w-36">Harga Satuan</th>
            <th className="text-right py-2.5 px-3 font-semibold text-gray-600 w-36 rounded-tr-lg">Total</th>
            <th className="w-8 no-print"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className="border-b border-gray-100 group" style={{ pageBreakInside: 'avoid' }}>
              {/* Item Name + Description */}
              <td className="py-2.5 px-3">
                <input
                  type="text"
                  value={item.item_name}
                  onChange={(e) => updateItem(item.id, { item_name: e.target.value })}
                  placeholder="Nama item"
                  className="editable-field w-full font-medium text-gray-900 bg-transparent text-sm"
                />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Deskripsi (opsional)"
                  className="editable-field w-full text-gray-400 text-xs bg-transparent mt-0.5"
                />
              </td>
              {/* Quantity */}
              <td className="py-2.5 px-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={getQtyDisplay(item)}
                  onChange={(e) => handleQtyChange(item.id, e.target.value)}
                  onBlur={() => handleQtyBlur(item.id)}
                  placeholder="1"
                  className="editable-field w-full text-right text-gray-700 bg-transparent"
                />
              </td>
              {/* Unit Price */}
              <td className="py-2.5 px-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={getPriceDisplay(item)}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  onBlur={() => handlePriceBlur(item.id, item.unit_price)}
                  placeholder="0"
                  className="editable-field w-full text-right text-gray-700 bg-transparent"
                />
              </td>
              {/* Total */}
              <td className="py-2.5 px-3 text-right font-medium text-gray-800">
                {formatCurrency(item.total_price, currency)}
              </td>
              {/* Delete */}
              <td className="py-2.5 pr-1 no-print">
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Item */}
      <button
        onClick={addItem}
        className="no-print mt-3 flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 transition px-3 py-1.5 rounded-lg hover:bg-blue-50"
      >
        <Plus className="w-4 h-4" />
        Tambah Item
      </button>
    </div>
  )
}

'use client'

import { useInvoiceStore } from '@/store/invoiceStore'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

export default function ItemsTable() {
  const { invoice, updateItem, addItem, removeItem } = useInvoiceStore()
  const { items, currency } = invoice

  const handleNumberInput = (
    id: string,
    field: 'quantity' | 'unit_price',
    raw: string
  ) => {
    // Allow only numbers and decimal point
    const cleaned = raw.replace(/[^0-9.]/g, '')
    const val = parseFloat(cleaned) || 0
    updateItem(id, { [field]: val })
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
                  value={item.quantity === 0 ? '' : item.quantity}
                  onChange={(e) => handleNumberInput(item.id, 'quantity', e.target.value)}
                  placeholder="1"
                  className="editable-field w-full text-right text-gray-700 bg-transparent"
                />
              </td>
              {/* Unit Price */}
              <td className="py-2.5 px-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={item.unit_price === 0 ? '' : item.unit_price}
                  onChange={(e) => handleNumberInput(item.id, 'unit_price', e.target.value)}
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

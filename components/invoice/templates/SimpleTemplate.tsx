'use client'

import { useInvoiceStore } from '@/store/invoiceStore'
import EditableField from '../EditableField'
import ItemsTable from '../ItemsTable'
import SummarySection from '../SummarySection'

export default function SimpleTemplate() {
  const { invoice, updateInvoice } = useInvoiceStore()

  return (
    <div className="p-10 font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <EditableField
            value={invoice.company_name}
            onChange={(v) => updateInvoice({ company_name: v })}
            className="text-2xl font-bold text-gray-900 block"
            placeholder="Nama / Brand Anda"
          />
          <EditableField
            value={invoice.sender_address}
            onChange={(v) => updateInvoice({ sender_address: v })}
            multiline
            className="text-sm text-gray-400 mt-1 block leading-relaxed"
            placeholder="Alamat Anda"
          />
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-700">Invoice</h1>
          <EditableField
            value={invoice.invoice_number}
            onChange={(v) => updateInvoice({ invoice_number: v })}
            className="text-sm text-gray-500 block mt-1"
            placeholder="INV-001"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      {/* Client + Dates */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Kepada</p>
          <EditableField
            value={invoice.client_name}
            onChange={(v) => updateInvoice({ client_name: v })}
            className="font-semibold text-gray-900 block"
            placeholder="Nama Klien"
          />
          <EditableField
            value={invoice.client_address}
            onChange={(v) => updateInvoice({ client_address: v })}
            multiline
            className="text-sm text-gray-400 mt-1 block leading-relaxed"
            placeholder="Alamat klien"
          />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Tanggal</span>
            <input
              type="date"
              value={invoice.issue_date}
              onChange={(e) => updateInvoice({ issue_date: e.target.value })}
              className="editable-field text-gray-700 bg-transparent text-right"
            />
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Jatuh Tempo</span>
            <input
              type="date"
              value={invoice.due_date}
              onChange={(e) => updateInvoice({ due_date: e.target.value })}
              className="editable-field text-gray-700 bg-transparent text-right"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <ItemsTable />

      {/* Summary */}
      <SummarySection />

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Catatan</p>
          <EditableField
            value={invoice.notes}
            onChange={(v) => updateInvoice({ notes: v })}
            multiline
            className="text-sm text-gray-500 leading-relaxed block"
            placeholder="Catatan atau syarat pembayaran..."
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Pembayaran</p>
          <EditableField
            value={invoice.bank_info}
            onChange={(v) => updateInvoice({ bank_info: v })}
            multiline
            className="text-sm text-gray-500 leading-relaxed block"
            placeholder="Info rekening bank..."
          />
        </div>
      </div>
    </div>
  )
}

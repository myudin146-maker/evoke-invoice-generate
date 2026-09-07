'use client'

import { useInvoiceStore } from '@/store/invoiceStore'
import EditableField from '../EditableField'
import ItemsTable from '../ItemsTable'
import SummarySection from '../SummarySection'
import { formatDate } from '@/lib/utils'
import { Building2 } from 'lucide-react'

export default function CompanyTemplate() {
  const { invoice, updateInvoice } = useInvoiceStore()

  return (
    <div className="p-10 font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        {/* Company Info */}
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            {invoice.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={invoice.logo_url}
                alt="Logo"
                className="h-16 w-16 object-contain rounded-xl border border-gray-100"
              />
            ) : (
              <div className="h-16 w-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-indigo-400" />
              </div>
            )}
          </div>
          <div>
            <EditableField
              value={invoice.company_name}
              onChange={(v) => updateInvoice({ company_name: v })}
              className="text-xl font-bold text-gray-900 block"
              placeholder="Nama Perusahaan"
            />
            <EditableField
              value={invoice.sender_address}
              onChange={(v) => updateInvoice({ sender_address: v })}
              multiline
              className="text-sm text-gray-500 mt-1 block leading-relaxed"
              placeholder="Alamat perusahaan"
            />
            <EditableField
              value={invoice.tax_number}
              onChange={(v) => updateInvoice({ tax_number: v })}
              className="text-sm text-gray-500 mt-1 block"
              placeholder="NPWP (opsional)"
            />
            <EditableField
              value={invoice.business_reg_number}
              onChange={(v) => updateInvoice({ business_reg_number: v })}
              className="text-sm text-gray-500 block"
              placeholder="No. Registrasi Bisnis (opsional)"
            />
          </div>
        </div>

        {/* Invoice Title */}
        <div className="text-right">
          <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">INVOICE</h1>
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            <div className="flex items-center justify-end gap-1">
              <span className="font-medium text-gray-700">#</span>
              <EditableField
                value={invoice.invoice_number}
                onChange={(v) => updateInvoice({ invoice_number: v })}
                className="font-semibold text-gray-800"
                placeholder="INV-001"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-indigo-600 mb-8" />

      {/* Bill To + Dates */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Bill To */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tagihan Kepada</p>
          <EditableField
            value={invoice.client_name}
            onChange={(v) => updateInvoice({ client_name: v })}
            className="text-base font-bold text-gray-900 block"
            placeholder="Nama Klien"
          />
          <EditableField
            value={invoice.client_address}
            onChange={(v) => updateInvoice({ client_address: v })}
            multiline
            className="text-sm text-gray-500 mt-1 block leading-relaxed"
            placeholder="Alamat klien"
          />
        </div>

        {/* Dates */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal Terbit</p>
            <input
              type="date"
              value={invoice.issue_date}
              onChange={(e) => updateInvoice({ issue_date: e.target.value })}
              className="editable-field text-sm font-medium text-gray-800 bg-transparent"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Jatuh Tempo</p>
            <input
              type="date"
              value={invoice.due_date}
              onChange={(e) => updateInvoice({ due_date: e.target.value })}
              className="editable-field text-sm font-medium text-gray-800 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <ItemsTable />

      {/* Summary */}
      <SummarySection />

      {/* Footer: Notes + Bank Info */}
      <div className="mt-10 grid grid-cols-2 gap-8 pt-6 border-t border-gray-100">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Catatan & Syarat</p>
          <EditableField
            value={invoice.notes}
            onChange={(v) => updateInvoice({ notes: v })}
            multiline
            className="text-sm text-gray-500 leading-relaxed block"
            placeholder="Tulis catatan, syarat, atau ketentuan di sini..."
          />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Informasi Rekening</p>
          <EditableField
            value={invoice.bank_info}
            onChange={(v) => updateInvoice({ bank_info: v })}
            multiline
            className="text-sm text-gray-500 leading-relaxed block"
            placeholder="Bank, No. Rekening, Atas Nama..."
          />
        </div>
      </div>

      {/* Stamp area */}
      <div className="mt-10 flex justify-end">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-12">Tanda Tangan &amp; Cap</p>
          <div className="border-b border-gray-300 w-40" />
          <p className="text-xs text-gray-500 mt-1">{invoice.company_name}</p>
        </div>
      </div>
    </div>
  )
}

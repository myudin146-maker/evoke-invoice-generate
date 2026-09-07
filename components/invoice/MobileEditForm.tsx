'use client'

import { useState, useRef } from 'react'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useAuth } from '@/context/AuthContext'
import { uploadLogo } from '@/lib/invoiceService'
import { formatCurrency } from '@/lib/utils'
import { X, Plus, Trash2, ChevronDown, ChevronUp, Pencil, Upload } from 'lucide-react'
import Button from '../ui/Button'

export default function MobileEditForm() {
  const {
    invoice, updateInvoice, updateItem, addItem, removeItem,
    getSubtotal, getTaxAmount, getDiscountAmount, getTotal,
  } = useInvoiceStore()
  const { user } = useAuth()

  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>('sender')
  const fileRef = useRef<HTMLInputElement>(null)

  const total = getTotal()

  const toggle = (s: string) => setActiveSection(activeSection === s ? null : s)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (user) {
      const url = await uploadLogo(file, user.id)
      if (url) updateInvoice({ logo_url: url })
    } else {
      const reader = new FileReader()
      reader.onload = (ev) => updateInvoice({ logo_url: ev.target?.result as string })
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700"
        onClick={() => toggle(id)}
      >
        {title}
        {activeSection === id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {activeSection === id && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )

  const Field = ({ label, value, onChange, multiline, type }: {
    label: string; value: string; onChange: (v: string) => void; multiline?: boolean; type?: string
  }) => (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 resize-none"
        />
      ) : (
        <input
          type={type || 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
        />
      )}
    </div>
  )

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-indigo-700 transition"
        aria-label="Edit Invoice"
      >
        <Pencil className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div>
          <h2 className="font-bold text-gray-900">Edit Invoice</h2>
          <p className="text-xs text-gray-400">{invoice.invoice_number}</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <Section id="sender" title="🏢 Info Pengirim">
          {/* Upload Logo */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-2">Logo Perusahaan</label>
            {invoice.logo_url && (
              <div className="flex items-center gap-2 mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={invoice.logo_url} alt="Logo" className="h-12 w-auto object-contain rounded-lg border border-gray-100" />
                <button
                  onClick={() => updateInvoice({ logo_url: null })}
                  className="text-xs text-red-400 hover:text-red-600 underline"
                >
                  Hapus logo
                </button>
              </div>
            )}
            <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition"
            >
              <Upload className="w-4 h-4" />
              {invoice.logo_url ? 'Ganti Logo' : 'Upload Logo'}
            </button>
          </div>
          <Field label="Nama Perusahaan" value={invoice.company_name} onChange={(v) => updateInvoice({ company_name: v })} />
          <Field label="Alamat" value={invoice.sender_address} onChange={(v) => updateInvoice({ sender_address: v })} multiline />
          <Field label="NPWP (opsional)" value={invoice.tax_number} onChange={(v) => updateInvoice({ tax_number: v })} />
        </Section>

        <Section id="client" title="👤 Info Klien">
          <Field label="Nama Klien" value={invoice.client_name} onChange={(v) => updateInvoice({ client_name: v })} />
          <Field label="Alamat Klien" value={invoice.client_address} onChange={(v) => updateInvoice({ client_address: v })} multiline />
        </Section>

        <Section id="meta" title="📋 Detail Invoice">
          <Field label="Nomor Invoice" value={invoice.invoice_number} onChange={(v) => updateInvoice({ invoice_number: v })} />
          <Field label="Tanggal Terbit" value={invoice.issue_date} onChange={(v) => updateInvoice({ issue_date: v })} type="date" />
          <Field label="Jatuh Tempo" value={invoice.due_date} onChange={(v) => updateInvoice({ due_date: v })} type="date" />
        </Section>

        <Section id="items" title="📦 Item">
          {invoice.items.map((item, idx) => (
            <div key={item.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Item {idx + 1}</span>
                {invoice.items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Field label="Nama" value={item.item_name} onChange={(v) => updateItem(item.id, { item_name: v })} />
              <Field label="Deskripsi" value={item.description} onChange={(v) => updateItem(item.id, { description: v })} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Harga Satuan</label>
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => updateItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
              <p className="text-xs text-right text-indigo-600 font-semibold">
                Total: {formatCurrency(item.total_price, invoice.currency)}
              </p>
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-indigo-200 rounded-xl text-sm text-indigo-500 hover:border-indigo-400 transition"
          >
            <Plus className="w-4 h-4" /> Tambah Item
          </button>
        </Section>

        <Section id="summary" title="🧮 Pajak & Diskon">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Pajak</label>
              <div className="flex gap-1">
                <select
                  value={invoice.tax_type}
                  onChange={(e) => updateInvoice({ tax_type: e.target.value as 'percent' | 'fixed' })}
                  className="border border-gray-200 rounded-lg px-2 py-2 text-xs"
                >
                  <option value="percent">%</option>
                  <option value="fixed">Rp</option>
                </select>
                <input
                  type="number"
                  value={invoice.tax_rate}
                  onChange={(e) => updateInvoice({ tax_rate: parseFloat(e.target.value) || 0 })}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Diskon</label>
              <div className="flex gap-1">
                <select
                  value={invoice.discount_type}
                  onChange={(e) => updateInvoice({ discount_type: e.target.value as 'percent' | 'fixed' })}
                  className="border border-gray-200 rounded-lg px-2 py-2 text-xs"
                >
                  <option value="percent">%</option>
                  <option value="fixed">Rp</option>
                </select>
                <input
                  type="number"
                  value={invoice.discount}
                  onChange={(e) => updateInvoice({ discount: parseFloat(e.target.value) || 0 })}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          <Field
            label="Ongkos Kirim"
            value={String(invoice.shipping)}
            onChange={(v) => updateInvoice({ shipping: parseFloat(v) || 0 })}
            type="number"
          />
          <div className="bg-indigo-50 rounded-xl p-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>{formatCurrency(getSubtotal(), invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Pajak</span><span>+{formatCurrency(getTaxAmount(), invoice.currency)}</span>
            </div>
            {getDiscountAmount() > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon</span><span>-{formatCurrency(getDiscountAmount(), invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-indigo-700 pt-1 border-t border-indigo-200">
              <span>Total</span><span>{formatCurrency(total, invoice.currency)}</span>
            </div>
          </div>
        </Section>

        <Section id="footer" title="📝 Catatan & Bank">
          <Field label="Catatan / Syarat" value={invoice.notes} onChange={(v) => updateInvoice({ notes: v })} multiline />
          <Field label="Info Rekening Bank" value={invoice.bank_info} onChange={(v) => updateInvoice({ bank_info: v })} multiline />
        </Section>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <Button variant="primary" className="w-full" onClick={() => setOpen(false)}>
          Selesai Edit
        </Button>
      </div>
    </div>
  )
}

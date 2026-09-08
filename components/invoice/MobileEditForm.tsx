'use client'

import { useState, useRef, memo, useCallback } from 'react'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useAuth } from '@/context/AuthContext'
import { uploadLogo } from '@/lib/invoiceService'
import { saveTemplate } from '@/lib/templateService'
import { formatCurrency } from '@/lib/utils'
import { X, Plus, Trash2, ChevronDown, ChevronUp, Pencil, Upload, BookOpen, Bookmark } from 'lucide-react'
import Button from '../ui/Button'
import TemplatePresetsModal from './TemplatePresetsModal'
import { InvoiceItem } from '@/types/invoice'

// ─── Sub-komponen statis (didefinisikan di luar agar tidak re-mount) ───────────

interface SectionProps {
  id: string
  title: string
  active: string | null
  onToggle: (id: string) => void
  children: React.ReactNode
}

const Section = memo(function Section({ id, title, active, onToggle, children }: SectionProps) {
  const isOpen = active === id
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700"
        onClick={() => onToggle(id)}
      >
        {title}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
})

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  type?: string
}

const Field = memo(function Field({ label, value, onChange, multiline, type }: FieldProps) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
        />
      ) : (
        <input
          type={type || 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
      )}
    </div>
  )
})

interface ItemRowProps {
  item: InvoiceItem
  index: number
  canDelete: boolean
  onUpdate: (id: string, updates: Partial<InvoiceItem>) => void
  onRemove: (id: string) => void
  currency: string
}

const ItemRow = memo(function ItemRow({ item, index, canDelete, onUpdate, onRemove, currency }: ItemRowProps) {
  return (
    <div className="border border-gray-100 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">Item {index + 1}</span>
        {canDelete && (
          <button type="button" onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">Nama</label>
        <input
          type="text"
          value={item.item_name}
          onChange={(e) => onUpdate(item.id, { item_name: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">Deskripsi</label>
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdate(item.id, { description: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Qty</label>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => onUpdate(item.id, { quantity: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Harga Satuan</label>
          <input
            type="number"
            value={item.unit_price}
            onChange={(e) => onUpdate(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>
      <p className="text-xs text-right text-blue-600 font-semibold">
        Total: {formatCurrency(item.total_price, currency as 'IDR' | 'USD')}
      </p>
    </div>
  )
})

// ─── Komponen utama ────────────────────────────────────────────────────────────

export default function MobileEditForm() {
  const {
    invoice, updateInvoice, updateItem, addItem, removeItem,
    getSubtotal, getTaxAmount, getDiscountAmount, getTotal,
  } = useInvoiceStore()
  const { user } = useAuth()

  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>('sender')
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateMsg, setTemplateMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleToggle = useCallback((id: string) => {
    setActiveSection((prev) => (prev === id ? null : id))
  }, [])

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
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSaveAsTemplate = async () => {
    if (!user) {
      alert('Login dulu untuk menyimpan template ke cloud.')
      return
    }
    const name = prompt('Nama template:', invoice.company_name)
    if (!name) return
    const result = await saveTemplate(name, invoice, user.id)
    if (result) {
      setTemplateMsg('📋 Template disimpan!')
      setTimeout(() => setTemplateMsg(''), 2500)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-50 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
        aria-label="Edit Invoice"
      >
        <Pencil className="w-6 h-6" />
      </button>
    )
  }

  const subtotal = getSubtotal()
  const taxAmount = getTaxAmount()
  const discountAmount = getDiscountAmount()
  const total = getTotal()

  return (
    <>
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0">
        <div>
          <h2 className="font-bold text-gray-900">Edit Invoice</h2>
          <p className="text-xs text-gray-400">{invoice.invoice_number}</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* Template actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            className="flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium border border-blue-100 hover:bg-blue-100 transition"
          >
            <BookOpen className="w-4 h-4" />
            Template Saya
          </button>
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            className="flex items-center justify-center gap-2 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium border border-amber-100 hover:bg-amber-100 transition"
          >
            <Bookmark className="w-4 h-4" />
            Simpan Template
          </button>
        </div>

        {templateMsg && (
          <div className="text-sm text-center py-2 px-3 bg-blue-50 text-blue-700 rounded-xl">
            {templateMsg}
          </div>
        )}
        <Section id="sender" title="🏢 Info Pengirim" active={activeSection} onToggle={handleToggle}>
          {/* Logo upload */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-2">Logo Perusahaan</label>
            {invoice.logo_url && (
              <div className="flex items-center gap-2 mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={invoice.logo_url} src={invoice.logo_url} alt="Logo" className="h-12 w-auto object-contain rounded-lg border border-gray-100" />
                <button type="button" onClick={() => updateInvoice({ logo_url: null })} className="text-xs text-red-400 hover:text-red-600 underline">
                  Hapus logo
                </button>
              </div>
            )}
            <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-500 transition"
            >
              <Upload className="w-4 h-4" />
              {invoice.logo_url ? 'Ganti Logo' : 'Upload Logo'}
            </button>
          </div>
          <Field label="Nama Perusahaan" value={invoice.company_name} onChange={(v) => updateInvoice({ company_name: v })} />
          <Field label="Alamat" value={invoice.sender_address} onChange={(v) => updateInvoice({ sender_address: v })} multiline />
          <Field label="NPWP (opsional)" value={invoice.tax_number} onChange={(v) => updateInvoice({ tax_number: v })} />
        </Section>

        <Section id="client" title="👤 Info Klien" active={activeSection} onToggle={handleToggle}>
          <Field label="Nama Klien" value={invoice.client_name} onChange={(v) => updateInvoice({ client_name: v })} />
          <Field label="Alamat Klien" value={invoice.client_address} onChange={(v) => updateInvoice({ client_address: v })} multiline />
        </Section>

        <Section id="meta" title="📋 Detail Invoice" active={activeSection} onToggle={handleToggle}>
          <Field label="Nomor Invoice" value={invoice.invoice_number} onChange={(v) => updateInvoice({ invoice_number: v })} />
          <Field label="Tanggal Terbit" value={invoice.issue_date} onChange={(v) => updateInvoice({ issue_date: v })} type="date" />
          <Field label="Jatuh Tempo" value={invoice.due_date} onChange={(v) => updateInvoice({ due_date: v })} type="date" />
        </Section>

        <Section id="items" title="📦 Item" active={activeSection} onToggle={handleToggle}>
          {invoice.items.map((item, idx) => (
            <ItemRow
              key={item.id}
              item={item}
              index={idx}
              canDelete={invoice.items.length > 1}
              onUpdate={updateItem}
              onRemove={removeItem}
              currency={invoice.currency}
            />
          ))}
          <button
            type="button"
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-blue-200 rounded-xl text-sm text-blue-500 hover:border-blue-400 transition"
          >
            <Plus className="w-4 h-4" /> Tambah Item
          </button>
        </Section>

        <Section id="summary" title="🧮 Pajak & Diskon" active={activeSection} onToggle={handleToggle}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Tipe Pajak</label>
              <select
                value={invoice.tax_type}
                onChange={(e) => updateInvoice({ tax_type: e.target.value as 'percent' | 'fixed' })}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm"
              >
                <option value="percent">Persen (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Pajak {invoice.tax_type === 'percent' ? '(%)' : '(Rp)'}
              </label>
              <input
                type="number"
                value={invoice.tax_rate}
                onChange={(e) => updateInvoice({ tax_rate: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Tipe Diskon</label>
              <select
                value={invoice.discount_type}
                onChange={(e) => updateInvoice({ discount_type: e.target.value as 'percent' | 'fixed' })}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm"
              >
                <option value="percent">Persen (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Diskon {invoice.discount_type === 'percent' ? '(%)' : '(Rp)'}
              </label>
              <input
                type="number"
                value={invoice.discount}
                onChange={(e) => updateInvoice({ discount: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <Field label="Ongkos Kirim (Rp)" value={String(invoice.shipping)} onChange={(v) => updateInvoice({ shipping: parseFloat(v) || 0 })} type="number" />
          {/* Ringkasan */}
          <div className="bg-blue-50 rounded-xl p-3 space-y-1.5 text-sm mt-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>{formatCurrency(subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Pajak</span><span>+{formatCurrency(taxAmount, invoice.currency)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon</span><span>-{formatCurrency(discountAmount, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-blue-700 pt-1.5 border-t border-blue-200">
              <span>Total</span><span>{formatCurrency(total, invoice.currency)}</span>
            </div>
          </div>
        </Section>

        <Section id="footer" title="📝 Catatan & Bank" active={activeSection} onToggle={handleToggle}>
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

    <TemplatePresetsModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} />
    </>
  )
}

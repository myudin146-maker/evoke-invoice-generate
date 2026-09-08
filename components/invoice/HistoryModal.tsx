'use client'

import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { getUserInvoices, deleteInvoice } from '@/lib/invoiceService'
import { saveTemplate } from '@/lib/templateService'
import { useAuth } from '@/context/AuthContext'
import { useInvoiceStore } from '@/store/invoiceStore'
import { SavedInvoice, InvoiceStatus } from '@/types/invoice'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2, FileEdit, Loader2, Bookmark } from 'lucide-react'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string }> = {
  draft:   { label: 'Draft',       color: 'bg-gray-100 text-gray-600' },
  sent:    { label: 'Dikirim',     color: 'bg-blue-100 text-blue-600' },
  paid:    { label: 'Dibayar',     color: 'bg-green-100 text-green-600' },
  overdue: { label: 'Jatuh Tempo', color: 'bg-red-100 text-red-600' },
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { user } = useAuth()
  const loadInvoice = useInvoiceStore((s) => s.loadInvoice)
  const [invoices, setInvoices] = useState<SavedInvoice[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true)
      getUserInvoices(user.id).then((data) => {
        setInvoices(data)
        setLoading(false)
      })
    }
  }, [isOpen, user])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleLoad = (inv: SavedInvoice) => {
    if (inv.data) {
      loadInvoice(inv.data, inv.id)
      showToast('✅ Invoice dimuat untuk diedit')
      setTimeout(() => onClose(), 800)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus invoice ini?')) return
    const ok = await deleteInvoice(id)
    if (ok) setInvoices((prev) => prev.filter((i) => i.id !== id))
  }

  const handleSaveAsTemplate = async (inv: SavedInvoice) => {
    if (!inv.data || !user) return
    const name = prompt('Nama template:', `${inv.data.company_name}`)
    if (!name) return
    const result = await saveTemplate(name, inv.data, user.id)
    if (result) showToast('📋 Disimpan sebagai template!')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Riwayat Invoice" className="max-w-lg">
      {toast && (
        <div className="mb-3 text-sm text-center py-2 px-3 bg-blue-50 text-blue-700 rounded-xl">
          {toast}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm">Belum ada invoice tersimpan</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {invoices.map((inv) => {
            const status = (inv.data?.status || inv.status || 'draft') as InvoiceStatus
            const cfg = STATUS_CONFIG[status]
            return (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900 truncate">{inv.invoice_number}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{inv.client_name}</p>
                  <p className="text-xs text-gray-400">{formatDate(inv.issue_date)}</p>
                </div>
                <div className="text-right mr-3">
                  <p className="text-sm font-semibold text-blue-600">
                    {formatCurrency(inv.total_amount, 'IDR')}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleLoad(inv)}
                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition"
                    title="Edit invoice"
                  >
                    <FileEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSaveAsTemplate(inv)}
                    className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-500 transition"
                    title="Jadikan template"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition"
                    title="Hapus invoice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

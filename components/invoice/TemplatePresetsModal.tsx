'use client'

import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useAuth } from '@/context/AuthContext'
import { getTemplates, deleteTemplate } from '@/lib/templateService'
import { CloudTemplate } from '@/types/invoice'
import { Trash2, FileText, Loader2 } from 'lucide-react'
import { generateInvoiceNumber } from '@/lib/utils'

interface TemplatePresetsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TemplatePresetsModal({ isOpen, onClose }: TemplatePresetsModalProps) {
  const { loadInvoice } = useInvoiceStore()
  const { user } = useAuth()
  const [templates, setTemplates] = useState<CloudTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true)
      getTemplates(user.id).then((data) => {
        setTemplates(data)
        setLoading(false)
      })
    }
  }, [isOpen, user])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleLoad = (template: CloudTemplate) => {
    // Load template tapi generate nomor invoice baru & reset data klien
    loadInvoice({
      ...template.data,
      invoice_number: generateInvoiceNumber(),
      client_name: 'Nama Klien',
      client_address: 'Alamat Klien, Kota, Kode Pos',
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
    showToast('✅ Template dimuat!')
    setTimeout(() => onClose(), 700)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus template ini?')) return
    const ok = await deleteTemplate(id)
    if (ok) setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Template Saya" className="max-w-md">
      {!user && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 mb-3">
          ⚠️ Login untuk menyimpan & mengakses template dari device manapun.
        </p>
      )}

      {toast && (
        <div className="mb-3 text-sm text-center py-2 px-3 bg-blue-50 text-blue-700 rounded-xl">
          {toast}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-10">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Belum ada template tersimpan</p>
          <p className="text-xs text-gray-300 mt-1">
            Simpan invoice sebagai template dari tombol &quot;Simpan Template&quot; di sidebar
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition group cursor-pointer"
              onClick={() => handleLoad(template)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{template.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {template.data.company_name} • {template.data.items.length} item
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(template.id) }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition"
                title="Hapus template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

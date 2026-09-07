'use client'

import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useInvoiceStore } from '@/store/invoiceStore'
import { InvoicePreset } from '@/types/invoice'
import { Trash2, FileText } from 'lucide-react'

interface TemplatePresetsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TemplatePresetsModal({ isOpen, onClose }: TemplatePresetsModalProps) {
  const loadInvoice = useInvoiceStore((s) => s.loadInvoice)
  const [presets, setPresets] = useState<InvoicePreset[]>([])

  useEffect(() => {
    if (isOpen) {
      const raw = localStorage.getItem('evoke-invoice-presets')
      setPresets(raw ? JSON.parse(raw) : [])
    }
  }, [isOpen])

  const handleLoad = (preset: InvoicePreset) => {
    loadInvoice(preset.data)
    onClose()
  }

  const handleDelete = (id: string) => {
    if (!confirm('Hapus template ini?')) return
    const updated = presets.filter((p) => p.id !== id)
    setPresets(updated)
    localStorage.setItem('evoke-invoice-presets', JSON.stringify(updated))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Template Saya" className="max-w-md">
      {presets.length === 0 ? (
        <div className="text-center py-10">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Belum ada template tersimpan</p>
          <p className="text-xs text-gray-300 mt-1">
            Simpan invoice sebagai template dari tombol di sidebar atau dari ikon bookmark di Riwayat
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition group cursor-pointer"
              onClick={() => handleLoad(preset)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{preset.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {preset.data.company_name} • {preset.data.items.length} item
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(preset.id) }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition"
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

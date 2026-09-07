'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { InvoiceData, InvoiceItem } from '@/types/invoice'
import { generateInvoiceNumber } from '@/lib/utils'

const today = new Date().toISOString().split('T')[0]
const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export const defaultInvoiceData: InvoiceData = {
  template: 'company',
  currency: 'IDR',
  status: 'draft',
  logo_url: null,
  company_name: 'Nama Perusahaan Anda',
  sender_address: 'Jl. Contoh No. 123, Jakarta, Indonesia',
  tax_number: '',
  business_reg_number: '',
  client_name: 'Nama Klien',
  client_address: 'Alamat Klien, Kota, Kode Pos',
  invoice_number: generateInvoiceNumber(),
  issue_date: today,
  due_date: dueDate,
  items: [
    {
      id: crypto.randomUUID(),
      item_name: 'Layanan / Produk',
      description: 'Deskripsi layanan atau produk',
      quantity: 1,
      unit_price: 1000000,
      total_price: 1000000,
    },
  ],
  tax_rate: 11,
  discount: 0,
  shipping: 0,
  tax_type: 'percent',
  discount_type: 'percent',
  notes: 'Terima kasih atas kepercayaan Anda. Pembayaran diharapkan sebelum tanggal jatuh tempo.',
  bank_info: 'Bank BCA\nNo. Rekening: 1234567890\nA.N. Nama Perusahaan',
}

interface InvoiceStore {
  invoice: InvoiceData
  isDirty: boolean
  currentInvoiceId: string | null
  updateInvoice: (updates: Partial<InvoiceData>) => void
  updateItem: (id: string, updates: Partial<InvoiceItem>) => void
  addItem: () => void
  removeItem: (id: string) => void
  resetInvoice: () => void
  loadInvoice: (data: InvoiceData, invoiceId?: string) => void
  setCurrentInvoiceId: (id: string | null) => void
  getSubtotal: () => number
  getTaxAmount: () => number
  getDiscountAmount: () => number
  getTotal: () => number
}

function recalcItem(item: InvoiceItem): InvoiceItem {
  const qty = Number(item.quantity) || 0
  const price = Number(item.unit_price) || 0
  const total = Math.round(qty * price * 100) / 100
  return { ...item, total_price: total }
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoice: defaultInvoiceData,
      isDirty: false,
      currentInvoiceId: null,

      updateInvoice: (updates) => {
        set((state) => ({
          invoice: { ...state.invoice, ...updates },
          isDirty: true,
        }))
      },

      updateItem: (id, updates) => {
        set((state) => ({
          invoice: {
            ...state.invoice,
            items: state.invoice.items.map((item) =>
              item.id === id ? recalcItem({ ...item, ...updates }) : item
            ),
          },
          isDirty: true,
        }))
      },

      addItem: () => {
        set((state) => ({
          invoice: {
            ...state.invoice,
            items: [
              ...state.invoice.items,
              {
                id: crypto.randomUUID(),
                item_name: 'Item Baru',
                description: '',
                quantity: 1,
                unit_price: 0,
                total_price: 0,
              },
            ],
          },
          isDirty: true,
        }))
      },

      removeItem: (id) => {
        set((state) => ({
          invoice: {
            ...state.invoice,
            items: state.invoice.items.filter((item) => item.id !== id),
          },
          isDirty: true,
        }))
      },

      resetInvoice: () => {
        set({
          invoice: { ...defaultInvoiceData, invoice_number: generateInvoiceNumber() },
          isDirty: false,
          currentInvoiceId: null,
        })
      },

      loadInvoice: (data, invoiceId) => {
        set({
          invoice: { ...data, status: data.status || 'draft' },
          isDirty: false,
          currentInvoiceId: invoiceId || null,
        })
      },

      setCurrentInvoiceId: (id) => set({ currentInvoiceId: id }),

      getSubtotal: () => {
        const { items } = get().invoice
        return items.reduce((sum, item) => Math.round((sum + (item.total_price || 0)) * 100) / 100, 0)
      },

      getTaxAmount: () => {
        const { tax_rate, tax_type } = get().invoice
        const subtotal = get().getSubtotal()
        if (tax_type === 'percent') return Math.round(subtotal * (Number(tax_rate) / 100) * 100) / 100
        return Number(tax_rate) || 0
      },

      getDiscountAmount: () => {
        const { discount, discount_type } = get().invoice
        const subtotal = get().getSubtotal()
        if (discount_type === 'percent') return Math.round(subtotal * (Number(discount) / 100) * 100) / 100
        return Number(discount) || 0
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const tax = get().getTaxAmount()
        const disc = get().getDiscountAmount()
        const shipping = Number(get().invoice.shipping) || 0
        return Math.round((subtotal + tax - disc + shipping) * 100) / 100
      },
    }),
    {
      name: 'evoke-invoice-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ invoice: state.invoice, currentInvoiceId: state.currentInvoiceId }),
    }
  )
)

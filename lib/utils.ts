import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Currency } from '@/types/invoice'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency = 'IDR'): string {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Safe float calculation using integer arithmetic (in cents)
export function safeMultiply(a: number, b: number): number {
  const factor = 100
  return Math.round(a * factor * b) / factor
}

export function safeAdd(...nums: number[]): number {
  const factor = 100
  return nums.reduce((acc, n) => Math.round(acc * factor + n * factor), 0) / factor
}

export function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `INV-${year}${month}-${random}`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Format angka dengan pemisah ribuan (titik) untuk ditampilkan di input.
 * Contoh: 1500000 → "1.500.000"
 */
export function formatNumberInput(value: number | string): string {
  if (value === '' || value === 0) return ''
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value
  if (isNaN(num) || num === 0) return ''
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Parse string angka berformat (titik ribuan) ke number.
 * Contoh: "1.500.000" → 1500000
 */
export function parseNumberInput(raw: string): number {
  // Hapus titik ribuan, ganti koma desimal ke titik
  const cleaned = raw.replace(/\./g, '').replace(',', '.')
  const val = parseFloat(cleaned)
  return isNaN(val) ? 0 : val
}

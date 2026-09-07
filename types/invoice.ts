export type InvoiceTemplate = 'company' | 'simple'
export type Currency = 'IDR' | 'USD'

export interface InvoiceItem {
  id: string
  item_name: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface InvoiceData {
  // Template
  template: InvoiceTemplate
  currency: Currency

  // Header
  logo_url: string | null
  company_name: string
  sender_address: string
  tax_number: string
  business_reg_number: string

  // Client Info
  client_name: string
  client_address: string

  // Metadata
  invoice_number: string
  issue_date: string
  due_date: string

  // Items
  items: InvoiceItem[]

  // Summary
  tax_rate: number
  discount: number
  shipping: number
  tax_type: 'percent' | 'fixed'
  discount_type: 'percent' | 'fixed'

  // Footer
  notes: string
  bank_info: string
}

export interface SavedInvoice {
  id: string
  user_id: string | null
  invoice_number: string
  issue_date: string
  due_date: string
  client_name: string
  subtotal: number
  tax_rate: number
  discount: number
  total_amount: number
  notes: string
  created_at: string
  data: InvoiceData
}

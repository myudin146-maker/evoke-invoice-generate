import { createClient } from '@/lib/supabase/client'
import { InvoiceData, SavedInvoice } from '@/types/invoice'

export async function saveInvoice(
  invoiceData: InvoiceData,
  subtotal: number,
  taxAmount: number,
  discountAmount: number,
  total: number,
  userId: string,
  existingId?: string
): Promise<{ id: string } | null> {
  const supabase = createClient()

  const invoicePayload = {
    user_id: userId,
    invoice_number: invoiceData.invoice_number,
    issue_date: invoiceData.issue_date,
    due_date: invoiceData.due_date,
    client_name: invoiceData.client_name,
    subtotal,
    tax_rate: invoiceData.tax_rate,
    discount: discountAmount,
    total_amount: total,
    notes: invoiceData.notes,
    status: invoiceData.status ?? 'draft',
    data: invoiceData,
  }

  if (existingId) {
    const { data, error } = await supabase
      .from('invoices')
      .update(invoicePayload)
      .eq('id', existingId)
      .select('id')
      .single()
    if (error) { console.error(error); return null }
    return data
  } else {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoicePayload)
      .select('id')
      .single()
    if (error) { console.error(error); return null }
    return data
  }
}

export async function getUserInvoices(userId: string): Promise<SavedInvoice[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) { console.error(error); return [] }
  return data || []
}

export async function deleteInvoice(invoiceId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
  if (error) { console.error(error); return false }
  return true
}

export async function uploadLogo(file: File, userId: string): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  // Tambahkan timestamp agar URL selalu unik dan tidak kena cache browser
  const filePath = `${userId}/logo_${Date.now()}.${ext}`

  // Hapus logo lama dulu
  const { data: existingFiles } = await supabase.storage
    .from('logos')
    .list(userId)

  if (existingFiles && existingFiles.length > 0) {
    const oldPaths = existingFiles.map((f) => `${userId}/${f.name}`)
    await supabase.storage.from('logos').remove(oldPaths)
  }

  // Upload file baru
  const { error } = await supabase.storage
    .from('logos')
    .upload(filePath, file, { upsert: false })

  if (error) { console.error(error); return null }

  const { data } = supabase.storage.from('logos').getPublicUrl(filePath)
  // Tambahkan cache-buster ke URL agar browser tidak pakai cache lama
  return `${data.publicUrl}?t=${Date.now()}`
}

// Sync local storage invoices to DB after login
export async function syncLocalToCloud(userId: string): Promise<void> {
  const raw = localStorage.getItem('evoke_guest_invoices')
  if (!raw) return
  try {
    const guestInvoices: InvoiceData[] = JSON.parse(raw)
    const supabase = createClient()
    for (const inv of guestInvoices) {
      await supabase.from('invoices').insert({
        user_id: userId,
        invoice_number: inv.invoice_number,
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        client_name: inv.client_name,
        subtotal: 0,
        tax_rate: inv.tax_rate,
        discount: inv.discount,
        total_amount: 0,
        notes: inv.notes,
        data: inv,
      })
    }
    localStorage.removeItem('evoke_guest_invoices')
  } catch (e) {
    console.error('Sync error', e)
  }
}

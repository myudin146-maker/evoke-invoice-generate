import { createClient } from '@/lib/supabase/client'
import { CloudTemplate, InvoiceData } from '@/types/invoice'

export async function getTemplates(userId: string): Promise<CloudTemplate[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('invoice_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export async function saveTemplate(
  name: string,
  data: InvoiceData,
  userId: string
): Promise<CloudTemplate | null> {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('invoice_templates')
    .insert({ user_id: userId, name, data })
    .select()
    .single()
  if (error) { console.error(error); return null }
  return result
}

export async function updateTemplate(
  id: string,
  name: string,
  data: InvoiceData
): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('invoice_templates')
    .update({ name, data })
    .eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('invoice_templates')
    .delete()
    .eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

// Migrasi template lama dari localStorage ke Supabase
export async function migrateLocalTemplatesToCloud(userId: string): Promise<void> {
  if (typeof window === 'undefined') return
  const key = `evoke-presets-${userId}`
  const raw = localStorage.getItem(key)
  if (!raw) return
  try {
    const local = JSON.parse(raw) as { name: string; data: InvoiceData }[]
    const supabase = createClient()
    for (const t of local) {
      await supabase
        .from('invoice_templates')
        .insert({ user_id: userId, name: t.name, data: t.data })
    }
    localStorage.removeItem(key)
    // Bersihkan juga key guest
    localStorage.removeItem('evoke-presets-guest')
  } catch (e) {
    console.error('Template migration error', e)
  }
}

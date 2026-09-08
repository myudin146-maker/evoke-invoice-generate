import { InvoicePreset } from '@/types/invoice'

// Key localStorage per user — template tidak bocor antar akun
function getPresetKey(userId?: string | null): string {
  return userId ? `evoke-presets-${userId}` : 'evoke-presets-guest'
}

export function getPresets(userId?: string | null): InvoicePreset[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getPresetKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePreset(preset: Omit<InvoicePreset, 'id' | 'created_at'>, userId?: string | null): InvoicePreset {
  const newPreset: InvoicePreset = {
    ...preset,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  const existing = getPresets(userId)
  const updated = [newPreset, ...existing]
  localStorage.setItem(getPresetKey(userId), JSON.stringify(updated))
  return newPreset
}

export function deletePreset(id: string, userId?: string | null): void {
  const existing = getPresets(userId)
  const updated = existing.filter((p) => p.id !== id)
  localStorage.setItem(getPresetKey(userId), JSON.stringify(updated))
}

// Hapus semua preset guest saat logout
export function clearGuestPresets(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('evoke-presets-guest')
}

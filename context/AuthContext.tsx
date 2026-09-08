'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || url === 'your_supabase_project_url' || !key || key === 'your_supabase_anon_key') {
      setLoading(false)
      return
    }

    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          const prevUser = user
          const nextUser = session?.user ?? null

          // Kalau ganti akun atau logout, reset draft invoice
          if (prevUser && prevUser.id !== nextUser?.id) {
            // Reset localStorage draft saat user berubah
            localStorage.removeItem('evoke-invoice-draft')
            // Reset currentInvoiceId
            import('@/store/invoiceStore').then(({ useInvoiceStore }) => {
              useInvoiceStore.getState().resetInvoice()
            })
          }

          // Saat login baru, migrasi template localStorage lama ke cloud
          if (event === 'SIGNED_IN' && nextUser) {
            import('@/lib/templateService').then(({ migrateLocalTemplatesToCloud }) => {
              migrateLocalTemplatesToCloud(nextUser.id)
            })
            // Sync invoice guest ke cloud
            import('@/lib/invoiceService').then(({ syncLocalToCloud }) => {
              syncLocalToCloud(nextUser.id)
            })
          }

          setSession(session)
          setUser(nextUser)
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || url === 'your_supabase_project_url' || !key) return

    // Reset draft saat logout
    localStorage.removeItem('evoke-invoice-draft')
    // Hapus preset guest
    const { clearGuestPresets } = await import('@/lib/presetService')
    clearGuestPresets()
    const { createClient } = await import('@/lib/supabase/client')
    await createClient().auth.signOut()

    // Reset store setelah logout
    const { useInvoiceStore } = await import('@/store/invoiceStore')
    useInvoiceStore.getState().resetInvoice()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

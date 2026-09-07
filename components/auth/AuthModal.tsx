'use client'

import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { createClient } from '@/lib/supabase/client'
import { syncLocalToCloud } from '@/lib/invoiceService'
import { Mail, Lock, Globe2 } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  const reset = () => {
    setEmail(''); setPassword(''); setError(''); setSuccess('')
  }

  const handleAuth = async () => {
    setError(''); setLoading(true)
    try {
      if (tab === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user) {
          await syncLocalToCloud(data.user.id)
        }
        onClose(); reset()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Cek email Anda untuk verifikasi akun!')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); reset() }} title="Akun Anda">
      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        {(['login', 'register'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); reset() }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        ))}
      </div>

      {/* Google */}
      <Button variant="secondary" className="w-full mb-4" onClick={handleGoogle}>
        <Globe2 className="w-4 h-4" />
        Lanjutkan dengan Google
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">atau dengan email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mt-3 p-2 bg-red-50 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-600 mt-3 p-2 bg-green-50 rounded-lg">{success}</p>}

      <Button
        variant="primary"
        className="w-full mt-4"
        loading={loading}
        onClick={handleAuth}
      >
        {tab === 'login' ? 'Masuk' : 'Buat Akun'}
      </Button>
    </Modal>
  )
}

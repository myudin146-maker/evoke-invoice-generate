'use client'

import { useState } from 'react'
import Image from 'next/image'
import { History, LogIn, LogOut, Plus, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Button from './ui/Button'
import AuthModal from './auth/AuthModal'
import HistoryModal from './invoice/HistoryModal'
import { useInvoiceStore } from '@/store/invoiceStore'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const resetInvoice = useInvoiceStore((s) => s.resetInvoice)

  return (
    <>
      <nav className="no-print sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="Evoke Invoice"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <span className="font-bold text-gray-900 text-base">Evoke</span>
              <span className="font-bold text-indigo-600 text-base"> Invoice</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetInvoice}
              className="hidden sm:flex"
            >
              <Plus className="w-4 h-4" />
              Baru
            </Button>

            {user ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Riwayat</span>
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-600 hidden md:block max-w-[140px] truncate">
                    {user.email}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAuth(true)}
              >
                <LogIn className="w-4 h-4" />
                Masuk / Daftar
              </Button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      {user && (
        <HistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  )
}

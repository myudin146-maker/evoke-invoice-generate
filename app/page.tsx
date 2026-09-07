import Navbar from '@/components/Navbar'
import InvoiceCanvas from '@/components/invoice/InvoiceCanvas'
import SidebarControls from '@/components/invoice/SidebarControls'
import MobileEditForm from '@/components/invoice/MobileEditForm'
import MobileBottomBar from '@/components/invoice/MobileBottomBar'
import HydrationGuard from '@/components/HydrationGuard'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar — hidden on mobile */}
          <aside className="no-print hidden lg:block w-72 flex-shrink-0 lg:sticky lg:top-20">
            <HydrationGuard>
              <SidebarControls />
            </HydrationGuard>
          </aside>

          {/* Invoice Canvas */}
          <div id="invoice-print-wrapper" className="flex-1 min-w-0 w-full">
            <HydrationGuard>
              <InvoiceCanvas />
            </HydrationGuard>
          </div>
        </div>
      </main>

      {/* Mobile bottom bar */}
      <MobileBottomBar />

      {/* Mobile edit FAB */}
      <HydrationGuard>
        <MobileEditForm />
      </HydrationGuard>
    </div>
  )
}

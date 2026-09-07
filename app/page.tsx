import Navbar from '@/components/Navbar'
import InvoiceCanvas from '@/components/invoice/InvoiceCanvas'
import SidebarControls from '@/components/invoice/SidebarControls'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar */}
          <aside className="no-print w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-20">
            <SidebarControls />
          </aside>

          {/* Invoice Canvas */}
          <div id="invoice-print-wrapper" className="flex-1 min-w-0 w-full">
            <InvoiceCanvas />
          </div>
        </div>
      </main>
    </div>
  )
}

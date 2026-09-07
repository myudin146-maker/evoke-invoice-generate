'use client'

export default function MobileBottomBar() {
  return (
    <div className="lg:hidden no-print fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-2 z-40">
      <button
        onClick={() => window.print()}
        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
      >
        🖨️ Print / PDF
      </button>
    </div>
  )
}

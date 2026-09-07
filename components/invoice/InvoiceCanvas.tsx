'use client'

import { useInvoiceStore } from '@/store/invoiceStore'
import CompanyTemplate from './templates/CompanyTemplate'
import SimpleTemplate from './templates/SimpleTemplate'

export default function InvoiceCanvas() {
  const template = useInvoiceStore((s) => s.invoice.template)

  return (
    <div className="flex justify-center">
      {/* Responsive scale wrapper */}
      <div className="w-full overflow-x-auto">
        <div
          id="invoice-canvas"
          className="bg-white shadow-xl rounded-2xl mx-auto"
          style={{ width: '794px', minHeight: '1123px' }}
        >
          {template === 'company' ? <CompanyTemplate /> : <SimpleTemplate />}
        </div>
      </div>
    </div>
  )
}

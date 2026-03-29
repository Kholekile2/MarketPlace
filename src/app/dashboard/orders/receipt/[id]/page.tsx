'use client'

import { useState, useEffect, use } from 'react'
import { PrinterIcon } from 'lucide-react'

interface Order {
  id: string
  customerName: string
  customerPhone: string
  productName: string
  price: number
  size: string
  deliveryAddress: string
  status: string
  paid: boolean
  notes: string
  courierName: string
  trackingNumber: string
  createdAt: string
}

const formatPrice = (price: number): string =>
  price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [businessName, setBusinessName] = useState('Your Business')

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) setOrder(data.order)
        if (data.businessName) setBusinessName(data.businessName)
      })
  }, [id])

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Order not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:bg-white print:p-0">
      <div className="max-w-md mx-auto">
        {/* Print Button — hidden when printing */}
        <div className="mb-4 flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print Receipt
          </button>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-6">
            <h1 className="text-2xl font-bold text-gray-900">{businessName}</h1>
            <p className="text-lg font-semibold text-gray-700 mt-1">SALES RECEIPT</p>
            <span className="mt-2 inline-block text-xs font-semibold text-red-600 border border-red-300 rounded px-2 py-0.5">
              NOT A TAX INVOICE
            </span>
          </div>

          {/* Receipt Meta */}
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Receipt No.</span>
              <span className="font-medium text-gray-900">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Customer */}
          <div className="border-t border-gray-200 pt-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium text-gray-900">{order.customerName}</span>
            </div>
            {order.customerPhone && (
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-900">{order.customerPhone}</span>
              </div>
            )}
          </div>

          {/* Product Line */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase">
                  <th className="text-left pb-2">Item</th>
                  <th className="text-right pb-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-gray-900 py-1">
                    {order.productName}
                    {order.size ? ` — Size ${order.size}` : ''}
                  </td>
                  <td className="text-gray-900 py-1 text-right font-medium">
                    R {formatPrice(order.price)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-900 pt-3 mb-6">
            <div className="flex justify-between font-bold text-gray-900">
              <span>TOTAL</span>
              <span>R {formatPrice(order.price)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Payment Status</span>
              <span
                className={`font-semibold ${
                  order.paid ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {order.paid ? 'PAID' : 'PENDING PAYMENT'}
              </span>
            </div>
          </div>

          {/* Delivery / Courier */}
          {(order.courierName || order.trackingNumber) && (
            <div className="border-t border-gray-200 pt-4 mb-6 space-y-1 text-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Delivery Info
              </p>
              {order.courierName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Courier</span>
                  <span className="text-gray-900">{order.courierName}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking No.</span>
                  <span className="text-gray-900">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer Footer */}
          <div className="border-t border-dashed border-gray-300 pt-4 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              This is a sales receipt only. It does not constitute a tax invoice, legally
              binding contract, or guarantee. All transactions are made directly between
              buyer and seller.
            </p>
            <p className="text-xs text-gray-400 mt-2">Thank you for your purchase!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

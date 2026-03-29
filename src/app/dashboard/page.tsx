'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PackageIcon, ShoppingCartIcon, PlusIcon, ClipboardListIcon } from 'lucide-react'

const formatPrice = (price: number): string =>
  price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

interface Order {
  id: string
  customerName: string
  productName: string
  price: number
  status: string
  paid: boolean
}

export default function DashboardPage() {
  const [totalProducts, setTotalProducts] = useState<number | null>(null)
  const [totalOrders, setTotalOrders] = useState<number | null>(null)
  const [paidRevenue, setPaidRevenue] = useState<number | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
    ]).then(([pd, od]) => {
      const products: unknown[] = pd.products ?? []
      const orders: Order[] = od.orders ?? []
      setTotalProducts(products.length)
      setTotalOrders(orders.length)
      setPaidRevenue(orders.filter((o) => o.paid).reduce((s, o) => s + o.price, 0))
      setRecentOrders(orders.slice(0, 5))
    })
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-600">Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <PackageIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{totalProducts ?? '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders ?? '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <ClipboardListIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Revenue (Paid)</p>
            <p className="text-2xl font-bold text-gray-900">
              {paidRevenue !== null ? `R ${formatPrice(paidRevenue)}` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/products"
          className="flex items-center p-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <p className="font-semibold">Add Product</p>
            <p className="text-blue-100 text-sm">Add a new item to your storefront</p>
          </div>
        </Link>

        <Link
          href="/dashboard/orders"
          className="flex items-center p-5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ShoppingCartIcon className="h-6 w-6 mr-3 flex-shrink-0 text-gray-600" />
          <div>
            <p className="font-semibold text-gray-900">View Orders</p>
            <p className="text-gray-500 text-sm">Manage and track customer orders</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-800">
            View all
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {totalOrders === null ? (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">Loading\u2026</div>
          ) : recentOrders.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <ShoppingCartIcon className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                No orders yet. Share your storefront link to get started!
              </p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.productName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    R {formatPrice(order.price)}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      statusColor[order.status] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
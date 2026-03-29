'use client'

import { useState, useEffect, useCallback } from 'react'
import { PlusIcon, PackageIcon, TruckIcon, PrinterIcon } from 'lucide-react'
import toast from 'react-hot-toast'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
  id: string
  customerName: string
  customerPhone: string
  productName: string
  price: number
  size: string
  deliveryAddress: string
  status: OrderStatus
  paid: boolean
  notes: string
  courierName: string
  trackingNumber: string
  createdAt: string
}

const formatPrice = (price: number): string =>
  price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

const emptyNewOrder = {
  customerName: '',
  customerPhone: '',
  productName: '',
  price: '',
  size: '',
  deliveryAddress: '',
  notes: '',
}

async function patchOrder(id: string, data: object) {
  const res = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update order')
  return res.json()
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [courierEdits, setCourierEdits] = useState<
    Record<string, { courierName: string; trackingNumber: string }>
  >({})
  const [newOrder, setNewOrder] = useState(emptyNewOrder)

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      const { order } = await patchOrder(id, { status })
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...order } : o)))
      toast.success(`Order marked as ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const togglePaid = async (id: string) => {
    const order = orders.find((o) => o.id === id)
    if (!order) return
    try {
      const { order: updated } = await patchOrder(id, { paid: !order.paid })
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)))
      toast.success(order.paid ? 'Marked as unpaid' : 'Marked as paid')
    } catch {
      toast.error('Failed to update payment status')
    }
  }

  const saveCourierInfo = async (id: string) => {
    const info = courierEdits[id]
    if (!info) return
    try {
      const { order: updated } = await patchOrder(id, {
        courierName: info.courierName,
        trackingNumber: info.trackingNumber,
      })
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)))
      toast.success('Courier info saved')
    } catch {
      toast.error('Failed to save courier info')
    }
  }

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/orders/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newOrder.customerName,
          customerPhone: newOrder.customerPhone,
          productName: newOrder.productName,
          size: newOrder.size,
          price: parseFloat(newOrder.price) || 0,
          deliveryAddress: newOrder.deliveryAddress,
          notes: newOrder.notes,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      await loadOrders()
      toast.success('Order added')
      setNewOrder(emptyNewOrder)
      setShowAddForm(false)
    } catch {
      toast.error('Failed to add order')
    }
  }

  const tabs = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'pending', label: 'Pending', count: orders.filter((o) => o.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: orders.filter((o) => o.status === 'confirmed').length },
    { key: 'shipped', label: 'Shipped', count: orders.filter((o) => o.status === 'shipped').length },
    { key: 'delivered', label: 'Delivered', count: orders.filter((o) => o.status === 'delivered').length },
  ]

  const filtered =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Orders</h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Order
        </button>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`whitespace-nowrap py-4 px-3 border-b-2 text-sm font-medium ${
                  filterStatus === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading orders\u2026</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <PackageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No orders here</h3>
            <p className="text-sm text-gray-500 mt-1">
              Add an order manually or share your store link to receive orders.
            </p>
          </div>
        ) : (
          filtered.map((order) => {
            const courier = courierEdits[order.id] ?? {
              courierName: order.courierName ?? '',
              trackingNumber: order.trackingNumber ?? '',
            }
            const sc = statusConfig[order.status]

            return (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left: Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="font-semibold text-gray-900 text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${sc.color}`}>
                        {sc.label}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.paid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 mb-3">
                      <p>
                        <span className="font-medium text-gray-700">Customer:</span>{' '}
                        {order.customerName}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Phone:</span> {order.customerPhone}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Product:</span> {order.productName}
                        {order.size ? ` (Size ${order.size})` : ''}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Amount:</span> R{' '}
                        {formatPrice(order.price)}
                      </p>
                      {order.deliveryAddress && (
                        <p className="sm:col-span-2">
                          <span className="font-medium text-gray-700">Address:</span>{' '}
                          {order.deliveryAddress}
                        </p>
                      )}
                      {order.notes && (
                        <p className="sm:col-span-2">
                          <span className="font-medium text-gray-700">Notes:</span> {order.notes}
                        </p>
                      )}
                      {(order.courierName || order.trackingNumber) && (
                        <p className="sm:col-span-2 text-xs text-gray-500">
                          <TruckIcon className="h-3 w-3 inline mr-1" />
                          {order.courierName && `${order.courierName}`}
                          {order.courierName && order.trackingNumber && ' \u00b7 '}
                          {order.trackingNumber && `#${order.trackingNumber}`}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString('en-ZA')}
                    </p>

                    {/* Courier / Tracking Fields */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                        <TruckIcon className="h-3 w-3 mr-1" />
                        Courier &amp; tracking (optional)
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Courier name (e.g. PAXI, RAM)"
                          value={courier.courierName}
                          onChange={(e) =>
                            setCourierEdits((prev) => ({
                              ...prev,
                              [order.id]: { ...courier, courierName: e.target.value },
                            }))
                          }
                          className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Tracking number"
                          value={courier.trackingNumber}
                          onChange={(e) =>
                            setCourierEdits((prev) => ({
                              ...prev,
                              [order.id]: { ...courier, trackingNumber: e.target.value },
                            }))
                          }
                          className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                        />
                        <button
                          onClick={() => saveCourierInfo(order.id)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md whitespace-nowrap"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch lg:min-w-[120px]">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'confirmed')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md text-center"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md text-center"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(order.id, 'shipped')}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md text-center"
                      >
                        Mark Shipped
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateStatus(order.id, 'delivered')}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md text-center"
                      >
                        Mark Delivered
                      </button>
                    )}
                    <button
                      onClick={() => togglePaid(order.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md text-center ${
                        order.paid
                          ? 'text-green-700 bg-green-100 hover:bg-green-200'
                          : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {order.paid ? '\u2713 Paid' : 'Mark Paid'}
                    </button>
                    <a
                      href={`/dashboard/orders/receipt/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center"
                    >
                      <PrinterIcon className="h-3 w-3 mr-1" />
                      Receipt
                    </a>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Order Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white my-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Order</h3>
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    required
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    value={newOrder.customerPhone}
                    onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="+27 82 123 4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product *
                  </label>
                  <input
                    required
                    value={newOrder.productName}
                    onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <input
                    value={newOrder.size}
                    onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="e.g. 9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (R) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={newOrder.price}
                  onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="1899"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newOrder.deliveryAddress}
                  onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Full delivery address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Any special instructions"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Add Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

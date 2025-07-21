'use client'

import { useState } from 'react'
import { 
  BellIcon, 
  CheckIcon, 
  XIcon, 
  PrinterIcon, 
  SendIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  CreditCardIcon,
  UserIcon,
  PackageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  product: string
  size: string
  quantity: number
  price: number
  deliveryOption: string
  deliveryAddress: string
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  orderStatus: 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  timestamp: string
  notes: string
  source: string
}

// Mock orders data
const ordersData: Order[] = [
  {
    id: 'ORD-001',
    orderNumber: 'SNK-20250720-001',
    customerName: 'Sipho Ndlovu',
    customerPhone: '+27 82 456 7890',
    customerEmail: 'sipho@gmail.com',
    product: 'Nike Air Force 1 White',
    size: '9',
    quantity: 1,
    price: 1899,
    deliveryOption: 'PAXI',
    deliveryAddress: '123 Main Street, Sandton, Johannesburg, 2196',
    paymentMethod: 'SnapScan',
    paymentStatus: 'pending',
    orderStatus: 'new',
    timestamp: '2025-07-20T10:30:00Z',
    notes: 'Customer requested urgent delivery for birthday gift',
    source: 'Instagram'
  },
  {
    id: 'ORD-002',
    orderNumber: 'SNK-20250720-002',
    customerName: 'Nomsa Mthembu',
    customerPhone: '+27 84 123 4567',
    customerEmail: 'nomsa.m@yahoo.com',
    product: 'Adidas Stan Smith',
    size: '7',
    quantity: 1,
    price: 1599,
    deliveryOption: 'Collection',
    deliveryAddress: 'Collection from store - Rosebank Mall',
    paymentMethod: 'Cash on Collection',
    paymentStatus: 'pending',
    orderStatus: 'confirmed',
    timestamp: '2025-07-20T09:15:00Z',
    notes: 'Available for collection after 2pm',
    source: 'TikTok'
  },
  {
    id: 'ORD-003',
    orderNumber: 'SNK-20250719-003',
    customerName: 'Thabo Molefe',
    customerPhone: '+27 83 789 0123',
    customerEmail: 'thabo.molefe@outlook.com',
    product: 'Puma RS-X',
    size: '10',
    quantity: 1,
    price: 2299,
    deliveryOption: 'Courier',
    deliveryAddress: '456 Oak Avenue, Cape Town, 8001',
    paymentMethod: 'EFT',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    timestamp: '2025-07-19T14:22:00Z',
    notes: '',
    source: 'WhatsApp'
  }
]

// Helper function for consistent price formatting (avoiding hydration mismatch)
const formatPrice = (price: number): string => {
  // Use a simple approach that works consistently on server and client
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function OrderManagement() {
  const [orders, setOrders] = useState(ordersData)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState('all')

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.orderStatus === filter
  })

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, orderStatus: newStatus as Order['orderStatus'] } : order
    ))
    toast.success(`Order ${orderId} marked as ${newStatus}`)
  }

  const updatePaymentStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, paymentStatus: newStatus as Order['paymentStatus'] } : order
    ))
    toast.success(`Payment ${newStatus} for order ${orderId}`)
  }

  const generateInvoice = (order: Order) => {
    toast.success(`Invoice INV-${order.orderNumber} generated and emailed to customer`)
    // Would integrate with invoice generation system
  }

  const sendSMSNotification = (order: Order, message: string) => {
    toast.success(`SMS sent to ${order.customerPhone}`)
    // Would integrate with SMS service
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800', 
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">Manage orders from your social media channels</p>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">New Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(o => o.orderStatus === 'new').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(o => o.orderStatus === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TruckIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(o => o.orderStatus === 'shipped').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Revenue Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                R {formatPrice(orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.price, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'new', label: 'New', count: orders.filter(o => o.orderStatus === 'new').length },
              { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.orderStatus === 'confirmed').length },
              { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.orderStatus === 'shipped').length },
              { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.orderStatus === 'delivered').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        Payment {order.paymentStatus}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        from {order.source}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(order.timestamp).toLocaleString('en-ZA')}
                    </span>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    {/* Customer Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        Customer
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.customerName}</p>
                        <p className="flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {order.customerPhone}
                        </p>
                        <p>{order.customerEmail}</p>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        <PackageIcon className="h-4 w-4 mr-1" />
                        Product
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.product}</p>
                        <p>Size: {order.size} • Qty: {order.quantity}</p>
                        <p className="font-semibold text-gray-900">R {formatPrice(order.price)}</p>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        Delivery
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.deliveryOption}</p>
                        <p>{order.deliveryAddress}</p>
                        <p>Payment: {order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="bg-blue-50 p-3 rounded-md mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {order.orderStatus === 'new' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Confirm Order
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <XIcon className="h-3 w-3 mr-1" />
                          Cancel
                        </button>
                      </>
                    )}

                    {order.orderStatus === 'confirmed' && (
                      <>
                        <button
                          onClick={() => generateInvoice(order)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <PrinterIcon className="h-3 w-3 mr-1" />
                          Generate Invoice
                        </button>
                        <button
                          onClick={() => sendSMSNotification(order, 'Your order is confirmed and being prepared for delivery')}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <SendIcon className="h-3 w-3 mr-1" />
                          Send Update
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                          <TruckIcon className="h-3 w-3 mr-1" />
                          Mark Shipped
                        </button>
                      </>
                    )}

                    {order.orderStatus === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Mark Delivered
                      </button>
                    )}

                    {order.paymentStatus === 'pending' && (
                      <button
                        onClick={() => updatePaymentStatus(order.id, 'paid')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <CreditCardIcon className="h-3 w-3 mr-1" />
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'Orders will appear here when customers place them through your business profile.' : `No ${filter} orders at the moment.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

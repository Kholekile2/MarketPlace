'use client'

import { useState } from 'react'
import { 
  ExternalLinkIcon, 
  CopyIcon, 
  EditIcon, 
  PlusIcon,
  BellIcon,
  CheckIcon,
  XIcon,
  InstagramIcon,
  MessageCircleIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

// Mock data for the seller's business
const businessData = {
  username: 'thandi',
  businessName: "Thandi's Sneaker Empire",
  profileUrl: "yourplatform.co.za/thandi",
  socialLinks: {
    instagram: "@thandisneakers",
    tiktok: "@thandisneakers_za"
  }
}

const incomingOrders = [
  {
    id: 'ORD-001',
    customerName: 'Sipho Ndlovu',
    product: 'Nike Air Force 1 White',
    size: '9',
    price: 1899,
    phone: '+27 82 456 7890',
    deliveryOption: 'PAXI',
    deliveryAddress: '123 Main Street, Sandton, Johannesburg, 2196',
    paymentMethod: 'SnapScan',
    status: 'pending',
    timestamp: '2025-07-20T10:30:00Z',
    customerEmail: 'sipho@gmail.com'
  },
  {
    id: 'ORD-002',
    customerName: 'Nomsa Mthembu',
    product: 'Adidas Stan Smith',
    size: '7',
    price: 1599,
    phone: '+27 84 123 4567',
    deliveryOption: 'Collection',
    deliveryAddress: 'Collection from store',
    paymentMethod: 'Cash on Collection',
    status: 'confirmed',
    timestamp: '2025-07-20T09:15:00Z',
    customerEmail: 'nomsa.m@yahoo.com'
  }
]

// Helper function for consistent price formatting (avoiding hydration mismatch)
const formatPrice = (price: number): string => {
  // Use a simple approach that works consistently on server and client
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function BusinessProfileDashboard() {
  const [orders, setOrders] = useState(incomingOrders)
  const [showLinkShare, setShowLinkShare] = useState(false)

  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
    toast.success(`Order ${orderId} ${newStatus}`)
  }

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`https://${businessData.profileUrl}`)
    toast.success('Profile link copied to clipboard!')
  }

  const generateInvoice = (order: any) => {
    toast.success('Invoice generated and sent to customer!')
    // This would integrate with the invoice system
  }

  const sendDeliveryInstructions = (order: any) => {
    toast.success('Delivery instructions sent via SMS!')
    // This would integrate with SMS service
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Business Profile</h1>
        <p className="text-gray-600">Manage your public business page and incoming orders</p>
      </div>

      {/* Business Profile Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{businessData.businessName}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <span>🔗 {businessData.profileUrl}</span>
              <span>👥 Connected to social media</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <a 
                href={`https://instagram.com/${businessData.socialLinks.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-pink-600 hover:text-pink-700 text-sm"
              >
                <InstagramIcon className="h-4 w-4 mr-1" />
                {businessData.socialLinks.instagram}
              </a>
              <a 
                href={`https://tiktok.com/${businessData.socialLinks.tiktok.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-800 hover:text-gray-900 text-sm"
              >
                <MessageCircleIcon className="h-4 w-4 mr-1" />
                {businessData.socialLinks.tiktok}
              </a>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowLinkShare(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              Share Profile Link
            </button>
            <a
              href={`/business/${businessData.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              View Public Page
            </a>
          </div>
        </div>
      </div>

      {/* Incoming Orders */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
              Incoming Orders ({orders.filter(o => o.status === 'pending').length} new)
            </h3>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {order.customerName} • {order.product} (Size {order.size})
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <p><strong>Phone:</strong> {order.phone}</p>
                      <p><strong>Email:</strong> {order.customerEmail}</p>
                      <p><strong>Payment:</strong> {order.paymentMethod}</p>
                    </div>
                    <div>
                      <p><strong>Delivery:</strong> {order.deliveryOption}</p>
                      <p><strong>Address:</strong> {order.deliveryAddress}</p>
                      <p><strong>Amount:</strong> R {formatPrice(order.price)}</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Received: {new Date(order.timestamp).toLocaleString('en-ZA')}
                  </p>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleOrderStatusChange(order.id, 'confirmed')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleOrderStatusChange(order.id, 'cancelled')}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <XIcon className="h-3 w-3 mr-1" />
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {order.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => generateInvoice(order)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Generate Invoice
                      </button>
                      <button
                        onClick={() => sendDeliveryInstructions(order)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Send Delivery Info
                      </button>
                      <button
                        onClick={() => handleOrderStatusChange(order.id, 'shipped')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                      >
                        Mark Shipped
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Share your profile link on social media to start receiving orders!
            </p>
          </div>
        )}
      </div>

      {/* Share Link Modal */}
      {showLinkShare && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Share Your Business Profile</h3>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-700 mb-2">Copy this link to share on social media:</p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm bg-white p-2 rounded border text-blue-600">
                    https://{businessData.profileUrl}
                  </code>
                  <button
                    onClick={copyProfileLink}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Example Social Media Post:</h4>
                <div className="text-sm text-blue-800 italic">
                  "🔥 New sneakers just dropped! Check out my latest collection and order directly: <br />
                  👉 https://{businessData.profileUrl} <br />
                  #SneakerHeads #JoziSneakers #AuthenticKicks"
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLinkShare(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Example integration: Enhanced Order Management with Delivery Tracking
// This shows how to integrate delivery tracking into the existing orders page

import { useState, useEffect } from 'react'
import { 
  TruckIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ExternalLinkIcon
} from 'lucide-react'
import { 
  deliveryManager, 
  TrackingInfo, 
  DeliveryStatus, 
  getDeliveryStatusColor, 
  getDeliveryStatusText,
  mockTrackingData 
} from '../services/delivery-tracking'

// Order interface (from existing orders page)
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

// Enhanced Order interface with delivery tracking
interface OrderWithTracking extends Order {
  trackingNumber?: string
  courierService?: string
  deliveryStatus?: DeliveryStatus
  estimatedDelivery?: string
  currentLocation?: string
}

// Delivery Tracking Component for Order Cards
export const DeliveryTrackingSection = ({ order }: { order: OrderWithTracking }) => {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrackingInfo = async () => {
    if (!order.trackingNumber || !order.courierService) return

    setLoading(true)
    setError(null)

    try {
      // For demo purposes, use mock data
      if (order.trackingNumber === 'DEMO-123') {
        setTrackingInfo(mockTrackingData)
      } else {
        const tracking = await deliveryManager.getTrackingInfo(
          order.courierService,
          order.trackingNumber
        )
        setTrackingInfo(tracking)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracking info')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrackingInfo()
  }, [order.trackingNumber, order.courierService])

  if (!order.trackingNumber) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
          <TruckIcon className="h-4 w-4 mr-2" />
          Delivery Tracking
        </h4>
        <p className="text-sm text-gray-600">No tracking number assigned yet</p>
        {order.orderStatus === 'confirmed' && (
          <button
            onClick={() => bookDelivery(order)}
            className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Book Delivery
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-blue-900 flex items-center">
          <TruckIcon className="h-4 w-4 mr-2" />
          Delivery Tracking
        </h4>
        <button
          onClick={fetchTrackingInfo}
          disabled={loading}
          className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm mb-3">
          <AlertCircleIcon className="h-4 w-4 inline mr-1" />
          {error}
        </div>
      )}

      {trackingInfo ? (
        <div className="space-y-3">
          {/* Tracking Number & Status */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-600">Tracking Number</p>
              <p className="font-mono text-sm">{trackingInfo.trackingNumber}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(trackingInfo.status)}`}>
              {getDeliveryStatusText(trackingInfo.status)}
            </span>
          </div>

          {/* Current Location */}
          <div className="flex items-center text-sm">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-700">{trackingInfo.currentLocation}</span>
          </div>

          {/* Estimated Delivery */}
          <div className="flex items-center text-sm">
            <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-700">
              Expected: {new Date(trackingInfo.estimatedDelivery).toLocaleDateString('en-ZA', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* Recent Events */}
          <div>
            <p className="text-xs text-gray-600 mb-1">Recent Updates</p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {trackingInfo.events.slice(0, 3).map((event, index) => (
                <div key={index} className="text-xs bg-white p-2 rounded border">
                  <div className="flex justify-between">
                    <span className="font-medium">{event.description}</span>
                    <span className="text-gray-500">
                      {new Date(event.timestamp).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                  {event.location && (
                    <p className="text-gray-600 mt-1">{event.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => window.open(`/tracking/${trackingInfo.trackingNumber}`, '_blank')}
              className="flex-1 text-xs bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <ExternalLinkIcon className="h-3 w-3 mr-1" />
              Full Tracking
            </button>
            <button
              onClick={() => shareTrackingWithCustomer(order, trackingInfo)}
              className="flex-1 text-xs bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Share with Customer
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading tracking info...</span>
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          <p>Tracking number: <span className="font-mono">{order.trackingNumber}</span></p>
          <p>Courier: {order.courierService}</p>
        </div>
      )}
    </div>
  )
}

// Delivery Booking Modal Component
export const DeliveryBookingModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onBooked 
}: { 
  order: OrderWithTracking
  isOpen: boolean
  onClose: () => void
  onBooked: (trackingInfo: any) => void
}) => {
  const [selectedCourier, setSelectedCourier] = useState('')
  const [deliveryCosts, setDeliveryCosts] = useState<Array<{ courier: string, cost: number, estimatedDays: number }>>([])
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    if (isOpen) {
      calculateDeliveryCosts()
    }
  }, [isOpen])

  const calculateDeliveryCosts = async () => {
    setLoading(true)
    try {
      const costs = await deliveryManager.calculateAllCosts({
        pickupAddress: {
          street: '123 Seller Street',
          city: 'Johannesburg',
          province: 'Gauteng',
          postalCode: '2000',
          country: 'ZA'
        },
        deliveryAddress: {
          street: order.deliveryAddress,
          city: 'Customer City',
          province: 'Gauteng',
          postalCode: '2196',
          country: 'ZA'
        },
        packageDetails: {
          weight: 1,
          dimensions: { length: 30, width: 20, height: 10 },
          value: order.price,
          description: order.product
        }
      })
      setDeliveryCosts(costs)
      if (costs.length > 0) {
        setSelectedCourier(costs[0].courier)
      }
    } catch (error) {
      console.error('Cost calculation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const bookDelivery = async () => {
    if (!selectedCourier) return

    setBooking(true)
    try {
      // For demo purposes, simulate booking
      const mockBookingResult = {
        trackingNumber: `${selectedCourier}-${Date.now()}`,
        courierService: selectedCourier,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        cost: deliveryCosts.find(c => c.courier === selectedCourier)?.cost || 0
      }

      onBooked(mockBookingResult)
      onClose()
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setBooking(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Book Delivery for Order {order.orderNumber}</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Calculating delivery costs...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Delivery Service
              </label>
              <div className="space-y-2">
                {deliveryCosts.map((option) => (
                  <label key={option.courier} className="flex items-center">
                    <input
                      type="radio"
                      name="courier"
                      value={option.courier}
                      checked={selectedCourier === option.courier}
                      onChange={(e) => setSelectedCourier(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex justify-between w-full">
                      <span>{option.courier}</span>
                      <div className="text-right">
                        <div className="font-semibold">R {option.cost}</div>
                        <div className="text-xs text-gray-500">{option.estimatedDays} days</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium mb-2">Delivery Details</h4>
              <div className="text-sm space-y-1">
                <p><strong>From:</strong> Your Business Address</p>
                <p><strong>To:</strong> {order.deliveryAddress}</p>
                <p><strong>Package:</strong> {order.product}</p>
                <p><strong>Customer:</strong> {order.customerName} ({order.customerPhone})</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={bookDelivery}
                disabled={!selectedCourier || booking}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {booking ? 'Booking...' : 'Book Delivery'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions for integration
const bookDelivery = (order: OrderWithTracking) => {
  // This would open the delivery booking modal
  console.log('Opening delivery booking modal for order:', order.id)
}

const shareTrackingWithCustomer = (order: OrderWithTracking, trackingInfo: TrackingInfo) => {
  const message = `Hi ${order.customerName}, your order ${order.orderNumber} is on the way! Track it here: ${window.location.origin}/tracking/${trackingInfo.trackingNumber}`
  
  // In production, this would send SMS or email
  console.log('Sharing tracking info:', message)
  
  // For demo, copy to clipboard
  navigator.clipboard.writeText(message).then(() => {
    alert('Tracking info copied to clipboard!')
  })
}

export default DeliveryTrackingSection

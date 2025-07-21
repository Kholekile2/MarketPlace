# Delivery Tracking Integration - SA Marketplace Platform

## Overview

This document outlines the delivery tracking integration strategy for external courier services (PAXI, RAM, PostNet, Courier Guy, etc.) to provide real-time tracking for both sellers and buyers on the SA Marketplace Platform.

## Problem Statement

- **Challenge**: Deliveries happen outside the platform through third-party couriers
- **Need**: Real-time tracking visibility for sellers and buyers
- **Goal**: Seamless integration with South African courier APIs for automated status updates

## South African Courier Services & APIs

### 1. PAXI (Pargo)
- **API Availability**: ✅ Full API integration available
- **Tracking Features**: Real-time status updates, delivery notifications
- **Integration Method**: REST API with webhooks
- **Documentation**: https://developers.pargo.co.za/

### 2. RAM Couriers
- **API Availability**: ✅ API available for tracking
- **Tracking Features**: Status updates, estimated delivery times
- **Integration Method**: REST API
- **Documentation**: Contact RAM for API access

### 3. PostNet
- **API Availability**: ✅ API available
- **Tracking Features**: Comprehensive tracking with delivery confirmation
- **Integration Method**: SOAP/REST API
- **Documentation**: Available through PostNet developer portal

### 4. Courier Guy
- **API Availability**: ✅ API available
- **Tracking Features**: Real-time tracking, delivery notifications
- **Integration Method**: REST API with webhooks
- **Documentation**: https://api.courierguy.co.za/

### 5. Dawn Wing
- **API Availability**: ✅ API available
- **Tracking Features**: Full tracking lifecycle
- **Integration Method**: REST API
- **Documentation**: Available through Dawn Wing

## Integration Architecture

### 1. Courier Service Manager
```typescript
interface CourierService {
  id: string
  name: string
  apiEndpoint: string
  apiKey: string
  isActive: boolean
  supportedServices: string[]
}

interface TrackingInfo {
  trackingNumber: string
  courierService: string
  status: DeliveryStatus
  estimatedDelivery: string
  currentLocation: string
  deliveryAddress: string
  events: TrackingEvent[]
}

interface TrackingEvent {
  timestamp: string
  status: string
  location: string
  description: string
}

enum DeliveryStatus {
  PENDING = 'pending',
  COLLECTED = 'collected',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED = 'returned'
}
```

### 2. Delivery Booking Integration
```typescript
// When seller confirms order and chooses delivery method
const bookDelivery = async (order: Order, deliveryMethod: string) => {
  const courier = getCourierService(deliveryMethod)
  
  const bookingRequest = {
    pickupAddress: seller.address,
    deliveryAddress: order.deliveryAddress,
    customerDetails: {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail
    },
    packageDetails: {
      weight: order.packageWeight,
      dimensions: order.packageDimensions,
      value: order.totalValue,
      description: order.productDescription
    },
    serviceType: order.deliveryOption, // Standard, Express, etc.
    notifications: {
      sms: true,
      email: true,
      webhooks: [process.env.WEBHOOK_URL]
    }
  }
  
  const response = await courier.bookDelivery(bookingRequest)
  
  // Update order with tracking information
  await updateOrder(order.id, {
    trackingNumber: response.trackingNumber,
    courierService: courier.name,
    deliveryStatus: 'pending',
    estimatedDelivery: response.estimatedDelivery
  })
  
  return response
}
```

### 3. Real-Time Tracking Updates
```typescript
// Webhook endpoint for courier status updates
app.post('/api/webhooks/delivery-update', async (req, res) => {
  const { trackingNumber, status, location, timestamp } = req.body
  
  // Verify webhook authenticity
  if (!verifyWebhookSignature(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // Update order status
  const order = await getOrderByTrackingNumber(trackingNumber)
  if (order) {
    await updateOrderDeliveryStatus(order.id, {
      status,
      location,
      timestamp,
      lastUpdated: new Date()
    })
    
    // Notify seller and buyer
    await sendDeliveryNotification(order, status, location)
  }
  
  res.json({ success: true })
})

// Periodic tracking updates (backup to webhooks)
const updateDeliveryStatuses = async () => {
  const activeDeliveries = await getActiveDeliveries()
  
  for (const delivery of activeDeliveries) {
    try {
      const courier = getCourierService(delivery.courierService)
      const trackingInfo = await courier.getTrackingInfo(delivery.trackingNumber)
      
      if (trackingInfo.status !== delivery.currentStatus) {
        await updateOrderDeliveryStatus(delivery.orderId, trackingInfo)
        await sendDeliveryNotification(delivery.order, trackingInfo.status, trackingInfo.location)
      }
    } catch (error) {
      console.error(`Tracking update failed for ${delivery.trackingNumber}:`, error)
    }
  }
}

// Run every 30 minutes
setInterval(updateDeliveryStatuses, 30 * 60 * 1000)
```

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1-2)
1. **Courier Service Management**
   - Create courier service configuration system
   - Implement base API wrapper classes
   - Set up webhook handling infrastructure

2. **Database Schema Updates**
   ```sql
   -- Add delivery tracking fields to orders table
   ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(255);
   ALTER TABLE orders ADD COLUMN courier_service VARCHAR(100);
   ALTER TABLE orders ADD COLUMN delivery_status VARCHAR(50);
   ALTER TABLE orders ADD COLUMN estimated_delivery DATETIME;
   ALTER TABLE orders ADD COLUMN current_location VARCHAR(255);
   
   -- Create tracking events table
   CREATE TABLE delivery_events (
     id SERIAL PRIMARY KEY,
     order_id VARCHAR(255) REFERENCES orders(id),
     tracking_number VARCHAR(255),
     event_type VARCHAR(100),
     location VARCHAR(255),
     description TEXT,
     timestamp DATETIME,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Create courier services configuration table
   CREATE TABLE courier_services (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100),
     api_endpoint VARCHAR(255),
     api_key_encrypted TEXT,
     is_active BOOLEAN DEFAULT true,
     supported_services JSON,
     webhook_secret VARCHAR(255),
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

### Phase 2: PAXI Integration (Week 3)
1. **PAXI API Integration**
   - Implement Pargo API wrapper
   - Set up delivery booking functionality
   - Configure webhooks for status updates

2. **Testing & Validation**
   - Test booking flow with PAXI sandbox
   - Validate tracking updates
   - Test notification system

### Phase 3: Additional Couriers (Week 4-5)
1. **RAM Couriers Integration**
2. **PostNet Integration**
3. **Courier Guy Integration**

### Phase 4: Enhanced Features (Week 6)
1. **Smart Delivery Recommendations**
2. **Cost Comparison**
3. **Performance Analytics**

## User Experience Flow

### For Sellers:
1. **Order Confirmation** → Choose delivery method from available couriers
2. **Automatic Booking** → System books delivery with chosen courier
3. **Tracking Dashboard** → Real-time delivery status in orders dashboard
4. **Notifications** → SMS/Email alerts for delivery milestones
5. **Customer Communication** → Share tracking info with customers

### For Buyers/Customers:
1. **Order Confirmation** → Receive tracking number and estimated delivery
2. **Tracking Link** → Access tracking page via SMS/Email link
3. **Real-Time Updates** → Receive notifications for delivery progress
4. **Delivery Confirmation** → Notification when package is delivered

## Technical Implementation

### 1. Courier API Wrapper
```typescript
// src/services/couriers/base-courier.ts
abstract class BaseCourierService {
  abstract bookDelivery(request: DeliveryBookingRequest): Promise<DeliveryBookingResponse>
  abstract getTrackingInfo(trackingNumber: string): Promise<TrackingInfo>
  abstract cancelDelivery(trackingNumber: string): Promise<boolean>
  abstract calculateCost(request: CostCalculationRequest): Promise<DeliveryCost>
}

// src/services/couriers/paxi-service.ts
class PaxiService extends BaseCourierService {
  private apiKey: string
  private baseUrl = 'https://api.pargo.co.za/v2'
  
  async bookDelivery(request: DeliveryBookingRequest): Promise<DeliveryBookingResponse> {
    const response = await fetch(`${this.baseUrl}/deliveries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pickup_address: request.pickupAddress,
        delivery_address: request.deliveryAddress,
        customer: request.customerDetails,
        package: request.packageDetails,
        service_type: request.serviceType,
        notifications: request.notifications
      })
    })
    
    const data = await response.json()
    return {
      trackingNumber: data.tracking_number,
      estimatedDelivery: data.estimated_delivery,
      cost: data.cost,
      pickupDate: data.pickup_date
    }
  }
  
  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    })
    
    const data = await response.json()
    return {
      trackingNumber,
      courierService: 'PAXI',
      status: this.mapStatus(data.status),
      estimatedDelivery: data.estimated_delivery,
      currentLocation: data.current_location,
      deliveryAddress: data.delivery_address,
      events: data.events.map(event => ({
        timestamp: event.timestamp,
        status: event.status,
        location: event.location,
        description: event.description
      }))
    }
  }
  
  private mapStatus(paxiStatus: string): DeliveryStatus {
    const statusMap = {
      'pending': DeliveryStatus.PENDING,
      'collected': DeliveryStatus.COLLECTED,
      'in_transit': DeliveryStatus.IN_TRANSIT,
      'out_for_delivery': DeliveryStatus.OUT_FOR_DELIVERY,
      'delivered': DeliveryStatus.DELIVERED,
      'failed': DeliveryStatus.FAILED_DELIVERY,
      'returned': DeliveryStatus.RETURNED
    }
    return statusMap[paxiStatus] || DeliveryStatus.PENDING
  }
}
```

### 2. Dashboard Integration
```typescript
// Add to orders dashboard component
const DeliveryTrackingSection = ({ order }: { order: Order }) => {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  
  useEffect(() => {
    if (order.trackingNumber) {
      fetchTrackingInfo(order.trackingNumber)
        .then(setTrackingInfo)
        .catch(console.error)
    }
  }, [order.trackingNumber])
  
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-2">Delivery Tracking</h4>
      {trackingInfo ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tracking Number:</span>
            <span className="font-mono">{trackingInfo.trackingNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Status:</span>
            <span className={`font-medium ${getStatusColor(trackingInfo.status)}`}>
              {trackingInfo.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Current Location:</span>
            <span>{trackingInfo.currentLocation}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Estimated Delivery:</span>
            <span>{new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}</span>
          </div>
          
          {/* Recent Events */}
          <div className="mt-3">
            <h5 className="text-xs font-medium text-gray-700 mb-1">Recent Updates:</h5>
            <div className="space-y-1">
              {trackingInfo.events.slice(0, 3).map((event, index) => (
                <div key={index} className="text-xs text-gray-600 flex justify-between">
                  <span>{event.description}</span>
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => window.open(`/tracking/${trackingInfo.trackingNumber}`, '_blank')}
            className="w-full mt-2 text-xs bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
          >
            View Full Tracking Details
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          {order.trackingNumber ? 'Loading tracking info...' : 'No tracking available'}
        </div>
      )}
    </div>
  )
}
```

### 3. Customer Tracking Page
```typescript
// src/app/tracking/[trackingNumber]/page.tsx
export default function TrackingPage({ params }: { params: { trackingNumber: string } }) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchPublicTrackingInfo(params.trackingNumber)
      .then(setTrackingInfo)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.trackingNumber])
  
  if (loading) return <LoadingSpinner />
  if (!trackingInfo) return <TrackingNotFound />
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Package Tracking</h1>
        
        {/* Status Timeline */}
        <DeliveryTimeline events={trackingInfo.events} currentStatus={trackingInfo.status} />
        
        {/* Package Details */}
        <PackageDetails trackingInfo={trackingInfo} />
        
        {/* Contact Information */}
        <ContactSupport courierService={trackingInfo.courierService} />
      </div>
    </div>
  )
}
```

## Security & Compliance

### 1. API Key Management
- Store courier API keys encrypted in environment variables
- Use separate keys for sandbox and production
- Implement key rotation policy

### 2. Webhook Security
- Verify webhook signatures from courier services
- Implement rate limiting on webhook endpoints
- Log all webhook requests for audit trail

### 3. Data Privacy (POPIA Compliance)
- Only store necessary tracking information
- Implement data retention policies
- Provide tracking data deletion on request

## Cost Management

### 1. Delivery Cost Calculation
```typescript
const calculateDeliveryCosts = async (order: Order, deliveryAddress: string) => {
  const availableCouriers = await getAvailableCouriers(deliveryAddress)
  const costs = []
  
  for (const courier of availableCouriers) {
    try {
      const cost = await courier.calculateCost({
        pickupAddress: order.seller.address,
        deliveryAddress,
        weight: order.packageWeight,
        dimensions: order.packageDimensions,
        value: order.totalValue,
        serviceType: 'standard'
      })
      costs.push({ courier: courier.name, ...cost })
    } catch (error) {
      console.error(`Cost calculation failed for ${courier.name}:`, error)
    }
  }
  
  return costs.sort((a, b) => a.totalCost - b.totalCost)
}
```

### 2. Smart Recommendations
- Recommend cheapest option for budget-conscious customers
- Recommend fastest option for urgent deliveries
- Consider courier reliability ratings

## Monitoring & Analytics

### 1. Delivery Performance Metrics
- Average delivery times per courier
- Delivery success rates
- Customer satisfaction scores
- Cost efficiency analysis

### 2. Alerting System
- Failed delivery notifications
- Delayed delivery alerts
- API service downtime detection
- Unusual tracking patterns

## Benefits for the Platform

### 1. Enhanced Trust
- Real-time visibility builds customer confidence
- Professional delivery handling
- Reduced customer support queries

### 2. Operational Efficiency
- Automated status updates
- Reduced manual tracking work
- Better customer communication

### 3. Business Intelligence
- Delivery performance data
- Customer location insights
- Courier service optimization

## Next Steps

1. **Immediate**: Set up PAXI integration (most widely used)
2. **Short-term**: Add RAM and PostNet integrations
3. **Medium-term**: Implement smart delivery recommendations
4. **Long-term**: Add delivery insurance and advanced analytics

This comprehensive delivery tracking system will ensure that both sellers and buyers have complete visibility into the delivery process, making the SA Marketplace Platform a truly professional business solution for South African entrepreneurs.

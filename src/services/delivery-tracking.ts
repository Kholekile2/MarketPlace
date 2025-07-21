// src/services/delivery-tracking.ts
'use client'

export interface DeliveryBookingRequest {
  pickupAddress: Address
  deliveryAddress: Address
  customerDetails: CustomerDetails
  packageDetails: PackageDetails
  serviceType: string
  notifications: NotificationSettings
}

export interface DeliveryBookingResponse {
  trackingNumber: string
  estimatedDelivery: string
  cost: number
  pickupDate: string
  courierService: string
}

export interface TrackingInfo {
  trackingNumber: string
  courierService: string
  status: DeliveryStatus
  estimatedDelivery: string
  currentLocation: string
  deliveryAddress: string
  events: TrackingEvent[]
  lastUpdated: string
}

export interface TrackingEvent {
  timestamp: string
  status: string
  location: string
  description: string
}

export enum DeliveryStatus {
  PENDING = 'pending',
  COLLECTED = 'collected',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED = 'returned'
}

export interface Address {
  street: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface CustomerDetails {
  name: string
  phone: string
  email: string
}

export interface PackageDetails {
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  value: number
  description: string
}

export interface NotificationSettings {
  sms: boolean
  email: boolean
  webhooks: string[]
}

// Base courier service class
export abstract class BaseCourierService {
  protected apiKey: string
  protected baseUrl: string
  protected isProduction: boolean

  constructor(apiKey: string, baseUrl: string, isProduction = false) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.isProduction = isProduction
  }

  abstract bookDelivery(request: DeliveryBookingRequest): Promise<DeliveryBookingResponse>
  abstract getTrackingInfo(trackingNumber: string): Promise<TrackingInfo>
  abstract cancelDelivery(trackingNumber: string): Promise<boolean>
  abstract calculateCost(request: Partial<DeliveryBookingRequest>): Promise<{ cost: number, estimatedDays: number }>
}

// PAXI (Pargo) Service Implementation
export class PaxiService extends BaseCourierService {
  constructor(apiKey: string, isProduction = false) {
    const baseUrl = isProduction 
      ? 'https://api.pargo.co.za/v2' 
      : 'https://api-sandbox.pargo.co.za/v2'
    super(apiKey, baseUrl, isProduction)
  }

  async bookDelivery(request: DeliveryBookingRequest): Promise<DeliveryBookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/deliveries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          pickup_address: this.formatAddress(request.pickupAddress),
          delivery_address: this.formatAddress(request.deliveryAddress),
          customer: {
            name: request.customerDetails.name,
            phone: request.customerDetails.phone,
            email: request.customerDetails.email
          },
          package: {
            weight: request.packageDetails.weight,
            length: request.packageDetails.dimensions.length,
            width: request.packageDetails.dimensions.width,
            height: request.packageDetails.dimensions.height,
            value: request.packageDetails.value,
            description: request.packageDetails.description
          },
          service_type: request.serviceType,
          notifications: {
            sms: request.notifications.sms,
            email: request.notifications.email,
            webhook_url: request.notifications.webhooks[0] || null
          }
        })
      })

      if (!response.ok) {
        throw new Error(`PAXI API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        trackingNumber: data.tracking_number,
        estimatedDelivery: data.estimated_delivery,
        cost: data.cost.total,
        pickupDate: data.pickup_date,
        courierService: 'PAXI'
      }
    } catch (error) {
      console.error('PAXI booking error:', error)
      throw new Error(`Failed to book PAXI delivery: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`PAXI Tracking API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        trackingNumber,
        courierService: 'PAXI',
        status: this.mapPaxiStatus(data.status),
        estimatedDelivery: data.estimated_delivery,
        currentLocation: data.current_location || 'In Transit',
        deliveryAddress: this.formatAddressString(data.delivery_address),
        events: data.events.map((event: any) => ({
          timestamp: event.timestamp,
          status: this.mapPaxiStatus(event.status),
          location: event.location || 'Unknown',
          description: event.description || event.status
        })),
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('PAXI tracking error:', error)
      throw new Error(`Failed to get PAXI tracking info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async cancelDelivery(trackingNumber: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/deliveries/${trackingNumber}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      console.error('PAXI cancellation error:', error)
      return false
    }
  }

  async calculateCost(request: Partial<DeliveryBookingRequest>): Promise<{ cost: number, estimatedDays: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          pickup_address: this.formatAddress(request.pickupAddress!),
          delivery_address: this.formatAddress(request.deliveryAddress!),
          package: {
            weight: request.packageDetails?.weight || 1,
            length: request.packageDetails?.dimensions?.length || 20,
            width: request.packageDetails?.dimensions?.width || 20,
            height: request.packageDetails?.dimensions?.height || 10,
            value: request.packageDetails?.value || 100
          },
          service_type: request.serviceType || 'standard'
        })
      })

      if (!response.ok) {
        throw new Error(`PAXI Quote API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        cost: data.cost.total,
        estimatedDays: data.estimated_days || 3
      }
    } catch (error) {
      console.error('PAXI cost calculation error:', error)
      throw new Error(`Failed to calculate PAXI cost: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private mapPaxiStatus(status: string): DeliveryStatus {
    const statusMap: { [key: string]: DeliveryStatus } = {
      'pending': DeliveryStatus.PENDING,
      'booked': DeliveryStatus.PENDING,
      'collected': DeliveryStatus.COLLECTED,
      'in_transit': DeliveryStatus.IN_TRANSIT,
      'out_for_delivery': DeliveryStatus.OUT_FOR_DELIVERY,
      'delivered': DeliveryStatus.DELIVERED,
      'failed_delivery': DeliveryStatus.FAILED_DELIVERY,
      'failed': DeliveryStatus.FAILED_DELIVERY,
      'returned': DeliveryStatus.RETURNED,
      'cancelled': DeliveryStatus.RETURNED
    }
    return statusMap[status.toLowerCase()] || DeliveryStatus.PENDING
  }

  private formatAddress(address: Address): object {
    return {
      street_address: address.street,
      city: address.city,
      province: address.province,
      postal_code: address.postalCode,
      country: address.country || 'ZA'
    }
  }

  private formatAddressString(address: any): string {
    if (typeof address === 'string') return address
    return `${address.street_address}, ${address.city}, ${address.province}, ${address.postal_code}`
  }
}

// RAM Couriers Service Implementation
export class RAMService extends BaseCourierService {
  constructor(apiKey: string, isProduction = false) {
    const baseUrl = isProduction 
      ? 'https://api.ramcouriers.co.za/v1' 
      : 'https://api-sandbox.ramcouriers.co.za/v1'
    super(apiKey, baseUrl, isProduction)
  }

  async bookDelivery(request: DeliveryBookingRequest): Promise<DeliveryBookingResponse> {
    // Implementation for RAM API
    throw new Error('RAM Couriers integration pending - contact RAM for API access')
  }

  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    // Implementation for RAM tracking
    throw new Error('RAM Couriers tracking integration pending')
  }

  async cancelDelivery(trackingNumber: string): Promise<boolean> {
    return false
  }

  async calculateCost(request: Partial<DeliveryBookingRequest>): Promise<{ cost: number, estimatedDays: number }> {
    // Mock implementation - replace with actual RAM API
    return { cost: 75, estimatedDays: 2 }
  }
}

// Delivery Service Manager
export class DeliveryManager {
  private services: Map<string, BaseCourierService> = new Map()

  constructor() {
    // Initialize courier services
    if (process.env.NEXT_PUBLIC_PAXI_API_KEY) {
      this.services.set('PAXI', new PaxiService(
        process.env.NEXT_PUBLIC_PAXI_API_KEY,
        process.env.NODE_ENV === 'production'
      ))
    }

    if (process.env.NEXT_PUBLIC_RAM_API_KEY) {
      this.services.set('RAM', new RAMService(
        process.env.NEXT_PUBLIC_RAM_API_KEY,
        process.env.NODE_ENV === 'production'
      ))
    }
  }

  getAvailableServices(): string[] {
    return Array.from(this.services.keys())
  }

  async bookDelivery(courierName: string, request: DeliveryBookingRequest): Promise<DeliveryBookingResponse> {
    const service = this.services.get(courierName)
    if (!service) {
      throw new Error(`Courier service ${courierName} not available`)
    }

    return await service.bookDelivery(request)
  }

  async getTrackingInfo(courierName: string, trackingNumber: string): Promise<TrackingInfo> {
    const service = this.services.get(courierName)
    if (!service) {
      throw new Error(`Courier service ${courierName} not available`)
    }

    return await service.getTrackingInfo(trackingNumber)
  }

  async calculateAllCosts(request: Partial<DeliveryBookingRequest>): Promise<Array<{ courier: string, cost: number, estimatedDays: number }>> {
    const results = []

    for (const [name, service] of Array.from(this.services.entries())) {
      try {
        const quote = await service.calculateCost(request)
        results.push({ courier: name, ...quote })
      } catch (error) {
        console.error(`Cost calculation failed for ${name}:`, error)
      }
    }

    return results.sort((a, b) => a.cost - b.cost)
  }
}

// Utility functions for order integration
export const deliveryManager = new DeliveryManager()

export const getDeliveryStatusColor = (status: DeliveryStatus): string => {
  const colors = {
    [DeliveryStatus.PENDING]: 'text-yellow-600 bg-yellow-100',
    [DeliveryStatus.COLLECTED]: 'text-blue-600 bg-blue-100',
    [DeliveryStatus.IN_TRANSIT]: 'text-purple-600 bg-purple-100',
    [DeliveryStatus.OUT_FOR_DELIVERY]: 'text-orange-600 bg-orange-100',
    [DeliveryStatus.DELIVERED]: 'text-green-600 bg-green-100',
    [DeliveryStatus.FAILED_DELIVERY]: 'text-red-600 bg-red-100',
    [DeliveryStatus.RETURNED]: 'text-gray-600 bg-gray-100'
  }
  return colors[status] || 'text-gray-600 bg-gray-100'
}

export const getDeliveryStatusText = (status: DeliveryStatus): string => {
  return status.replace('_', ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Mock data for development/testing
export const mockTrackingData: TrackingInfo = {
  trackingNumber: 'PAXI123456789',
  courierService: 'PAXI',
  status: DeliveryStatus.IN_TRANSIT,
  estimatedDelivery: '2025-07-23T16:00:00Z',
  currentLocation: 'Johannesburg Distribution Center',
  deliveryAddress: '123 Main Street, Sandton, Johannesburg, 2196',
  events: [
    {
      timestamp: '2025-07-21T08:00:00Z',
      status: 'collected',
      location: 'Rosebank Collection Point',
      description: 'Package collected from seller'
    },
    {
      timestamp: '2025-07-21T12:30:00Z',
      status: 'in_transit',
      location: 'Johannesburg Distribution Center',
      description: 'Package in transit to destination'
    },
    {
      timestamp: '2025-07-22T09:15:00Z',
      status: 'out_for_delivery',
      location: 'Sandton Delivery Hub',
      description: 'Out for delivery - expected today'
    }
  ],
  lastUpdated: '2025-07-22T09:15:00Z'
}

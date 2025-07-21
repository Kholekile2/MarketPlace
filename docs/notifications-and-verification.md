# Order Notifications & Buyer Verification System

## Overview

This document outlines the implementation of real-time order notifications for sellers and comprehensive buyer verification/protection systems to ensure secure transactions on the SA Marketplace Platform.

## Problem Statement

### 1. Missing Order Notifications
- **Current Issue**: Sellers don't receive notifications when orders are placed
- **Impact**: Delayed order processing, poor customer experience
- **Solution**: Real-time notification system with multiple channels

### 2. Buyer Verification & Security
- **Current Issue**: Limited buyer verification beyond social media presence
- **Risk**: Scammers, fake orders, payment fraud, safety concerns
- **Solution**: Multi-layered verification and protection system

## Order Notification System

### 1. Real-Time Notification Architecture

#### Notification Channels
```typescript
enum NotificationChannel {
  PUSH = 'push',           // Browser/Mobile push notifications
  SMS = 'sms',             // SMS via South African providers
  EMAIL = 'email',         // Email notifications
  WHATSAPP = 'whatsapp',   // WhatsApp Business API
  IN_APP = 'in_app'        // Dashboard notifications
}

interface NotificationPreferences {
  newOrder: NotificationChannel[]
  orderUpdate: NotificationChannel[]
  paymentReceived: NotificationChannel[]
  deliveryUpdate: NotificationChannel[]
  emergencyAlerts: NotificationChannel[]
}
```

#### Real-Time Implementation
```typescript
// src/services/notifications.ts
export class NotificationService {
  private static instance: NotificationService
  private socket: WebSocket | null = null
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Initialize WebSocket connection for real-time notifications
  initializeRealTime(sellerId: string) {
    this.socket = new WebSocket(`wss://api.samarketplace.co.za/notifications/${sellerId}`)
    
    this.socket.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      this.handleNotification(notification)
    }
  }

  private handleNotification(notification: Notification) {
    // Show browser notification
    this.showBrowserNotification(notification)
    
    // Play sound alert
    this.playNotificationSound(notification.priority)
    
    // Update dashboard counter
    this.updateDashboardCounter(notification.type)
    
    // Store in local notifications list
    this.storeNotification(notification)
  }

  async sendOrderNotification(order: Order, sellerId: string) {
    const seller = await getSellerById(sellerId)
    const preferences = seller.notificationPreferences
    
    const notification = {
      id: generateId(),
      type: 'new_order',
      title: 'New Order Received!',
      message: `Order ${order.orderNumber} from ${order.customerName}`,
      orderId: order.id,
      timestamp: new Date().toISOString(),
      priority: 'high'
    }

    // Send via preferred channels
    if (preferences.newOrder.includes('sms')) {
      await this.sendSMS(seller.phone, notification)
    }
    
    if (preferences.newOrder.includes('email')) {
      await this.sendEmail(seller.email, notification)
    }
    
    if (preferences.newOrder.includes('whatsapp')) {
      await this.sendWhatsApp(seller.whatsappNumber, notification)
    }
    
    if (preferences.newOrder.includes('push')) {
      await this.sendPushNotification(sellerId, notification)
    }
  }
}
```

### 2. SMS Integration (South African Providers)

#### SMS Service Implementation
```typescript
// src/services/sms.ts
export class SMSService {
  private providers = {
    clickatell: new ClickatellProvider(),
    bulksms: new BulkSMSProvider(),
    smsportal: new SMSPortalProvider()
  }

  async sendSMS(phoneNumber: string, message: string, priority: 'high' | 'normal' = 'normal') {
    // Format SA phone number
    const formattedNumber = this.formatSAPhoneNumber(phoneNumber)
    
    // Try primary provider first
    try {
      return await this.providers.clickatell.send(formattedNumber, message)
    } catch (error) {
      console.error('Primary SMS provider failed, trying backup:', error)
      
      // Fallback to secondary provider
      try {
        return await this.providers.bulksms.send(formattedNumber, message)
      } catch (backupError) {
        console.error('Backup SMS provider failed:', backupError)
        throw new Error('All SMS providers failed')
      }
    }
  }

  private formatSAPhoneNumber(phone: string): string {
    // Convert to international format (+27...)
    let cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('0')) {
      cleaned = '27' + cleaned.substring(1)
    } else if (!cleaned.startsWith('27')) {
      cleaned = '27' + cleaned
    }
    
    return '+' + cleaned
  }
}

// Clickatell Provider (Popular in SA)
class ClickatellProvider {
  private apiKey = process.env.CLICKATELL_API_KEY
  private baseUrl = 'https://platform.clickatell.com/messages'

  async send(phoneNumber: string, message: string) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          to: [phoneNumber],
          content: {
            text: message
          }
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Clickatell SMS failed: ${response.statusText}`)
    }

    return await response.json()
  }
}
```

### 3. WhatsApp Business Integration

```typescript
// src/services/whatsapp.ts
export class WhatsAppService {
  private apiUrl = 'https://graph.facebook.com/v17.0'
  private accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  private phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  async sendOrderNotification(phoneNumber: string, order: Order) {
    const message = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: 'order_notification',
        language: { code: 'en' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: order.orderNumber },
            { type: 'text', text: order.customerName },
            { type: 'text', text: `R ${order.price}` },
            { type: 'text', text: order.product }
          ]
        }]
      }
    }

    const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })

    return await response.json()
  }
}
```

## Buyer Verification & Protection System

### 1. Multi-Layer Verification

#### Verification Levels
```typescript
enum VerificationLevel {
  UNVERIFIED = 0,      // No verification
  BASIC = 1,           // Phone + Email verified
  STANDARD = 2,        // + ID verification
  VERIFIED = 3,        // + Address verification
  PREMIUM = 4          // + Bank account verification
}

interface BuyerProfile {
  id: string
  personalInfo: {
    name: string
    surname: string
    idNumber?: string
    dateOfBirth?: string
    address?: Address
  }
  contactInfo: {
    phone: string
    phoneVerified: boolean
    email: string
    emailVerified: boolean
    whatsappNumber?: string
  }
  verification: {
    level: VerificationLevel
    idVerified: boolean
    addressVerified: boolean
    bankAccountVerified: boolean
    socialMediaVerified: boolean
    reputationScore: number
    verificationDate?: string
  }
  orderHistory: {
    totalOrders: number
    successfulOrders: number
    cancelledOrders: number
    disputedOrders: number
    averageOrderValue: number
  }
}
```

#### ID Verification (South African)
```typescript
// src/services/verification.ts
export class VerificationService {
  async verifyIDNumber(idNumber: string, name: string, surname: string): Promise<boolean> {
    // Validate SA ID number format
    if (!this.isValidSAIDNumber(idNumber)) {
      throw new Error('Invalid South African ID number format')
    }

    // Optional: Integrate with Home Affairs verification
    // This would require official API access
    try {
      const response = await fetch('/api/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idNumber, name, surname })
      })
      
      return response.ok
    } catch (error) {
      console.error('ID verification failed:', error)
      return false
    }
  }

  private isValidSAIDNumber(idNumber: string): boolean {
    if (idNumber.length !== 13) return false
    
    // Check if all characters are digits
    if (!/^\d+$/.test(idNumber)) return false
    
    // Validate checksum digit (Luhn algorithm for SA IDs)
    const digits = idNumber.split('').map(Number)
    let sum = 0
    
    for (let i = 0; i < 12; i++) {
      if (i % 2 === 0) {
        sum += digits[i]
      } else {
        const doubled = digits[i] * 2
        sum += doubled > 9 ? doubled - 9 : doubled
      }
    }
    
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === digits[12]
  }

  async verifyBankAccount(accountNumber: string, bankCode: string, accountHolder: string): Promise<boolean> {
    // Integrate with South African banks for account verification
    // This would typically use services like BankservAfrica
    try {
      const response = await fetch('/api/verify-bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, bankCode, accountHolder })
      })
      
      return response.ok
    } catch (error) {
      console.error('Bank account verification failed:', error)
      return false
    }
  }
}
```

### 2. Social Media Verification

```typescript
// src/services/social-verification.ts
export class SocialMediaVerificationService {
  async verifySocialMediaAccount(platform: string, profileUrl: string, userId: string): Promise<SocialVerificationResult> {
    const verification = {
      platform,
      profileUrl,
      verified: false,
      accountAge: 0,
      followerCount: 0,
      postCount: 0,
      riskScore: 0,
      flags: [] as string[]
    }

    try {
      switch (platform.toLowerCase()) {
        case 'facebook':
          return await this.verifyFacebookProfile(profileUrl, verification)
        case 'instagram':
          return await this.verifyInstagramProfile(profileUrl, verification)
        case 'tiktok':
          return await this.verifyTikTokProfile(profileUrl, verification)
        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
    } catch (error) {
      verification.flags.push('verification_failed')
      verification.riskScore = 100
      return verification
    }
  }

  private async verifyFacebookProfile(url: string, verification: SocialVerificationResult): Promise<SocialVerificationResult> {
    // Check profile age, friend count, post history
    // Look for red flags: new account, no friends, stock photos
    
    // Mock implementation - in production, use Facebook Graph API
    verification.accountAge = 365 // days
    verification.followerCount = 150
    verification.postCount = 50
    
    if (verification.accountAge < 30) {
      verification.flags.push('new_account')
      verification.riskScore += 30
    }
    
    if (verification.followerCount < 10) {
      verification.flags.push('low_friend_count')
      verification.riskScore += 25
    }
    
    if (verification.postCount < 5) {
      verification.flags.push('inactive_account')
      verification.riskScore += 20
    }
    
    verification.verified = verification.riskScore < 50
    return verification
  }
}

interface SocialVerificationResult {
  platform: string
  profileUrl: string
  verified: boolean
  accountAge: number
  followerCount: number
  postCount: number
  riskScore: number
  flags: string[]
}
```

### 3. Reputation & Trust System

```typescript
// src/services/reputation.ts
export class ReputationService {
  async calculateReputationScore(buyerId: string): Promise<number> {
    const buyer = await getBuyerProfile(buyerId)
    let score = 50 // Start with neutral score
    
    // Order history factors
    const successRate = buyer.orderHistory.successfulOrders / buyer.orderHistory.totalOrders
    score += (successRate - 0.5) * 60 // +/-30 points based on success rate
    
    // Verification level bonus
    score += buyer.verification.level * 10
    
    // Social media verification
    if (buyer.verification.socialMediaVerified) {
      score += 15
    }
    
    // Account age (if available)
    const accountAgeMonths = this.getAccountAgeInMonths(buyer.createdAt)
    score += Math.min(accountAgeMonths * 2, 20) // Up to 20 points for account age
    
    // Disputed orders penalty
    const disputeRate = buyer.orderHistory.disputedOrders / buyer.orderHistory.totalOrders
    score -= disputeRate * 40
    
    // Keep score between 0-100
    return Math.max(0, Math.min(100, score))
  }

  async flagSuspiciousActivity(buyerId: string, activity: SuspiciousActivity) {
    // Log suspicious activity
    await this.logActivity(buyerId, activity)
    
    // Automatic actions based on severity
    if (activity.severity === 'high') {
      await this.temporaryBuyerSuspension(buyerId)
      await this.notifyAdmins(buyerId, activity)
    } else if (activity.severity === 'medium') {
      await this.requireAdditionalVerification(buyerId)
    }
  }
}

interface SuspiciousActivity {
  type: 'multiple_failed_payments' | 'unusual_order_pattern' | 'fake_contact_info' | 'dispute_pattern'
  severity: 'low' | 'medium' | 'high'
  description: string
  metadata: Record<string, any>
}
```

### 4. Safe Transaction Protocols

```typescript
// src/services/transaction-safety.ts
export class TransactionSafetyService {
  async validateOrder(order: Order, buyer: BuyerProfile): Promise<OrderValidationResult> {
    const validationResult = {
      approved: false,
      riskLevel: 'low' as 'low' | 'medium' | 'high',
      flags: [] as string[],
      requiredActions: [] as string[],
      escrowRecommended: false
    }

    // Check buyer reputation
    const reputationScore = await this.reputationService.calculateReputationScore(buyer.id)
    
    if (reputationScore < 30) {
      validationResult.riskLevel = 'high'
      validationResult.flags.push('low_reputation_buyer')
      validationResult.escrowRecommended = true
    }
    
    // Check order value vs buyer history
    const avgOrderValue = buyer.orderHistory.averageOrderValue
    if (order.totalValue > avgOrderValue * 3) {
      validationResult.riskLevel = 'medium'
      validationResult.flags.push('unusually_high_order_value')
      validationResult.requiredActions.push('verify_payment_method')
    }
    
    // Check verification level requirements
    if (order.totalValue > 5000 && buyer.verification.level < VerificationLevel.STANDARD) {
      validationResult.flags.push('insufficient_verification')
      validationResult.requiredActions.push('upgrade_verification')
    }
    
    // Location-based checks
    if (this.isHighRiskDeliveryArea(order.deliveryAddress)) {
      validationResult.riskLevel = 'medium'
      validationResult.flags.push('high_risk_delivery_area')
      validationResult.requiredActions.push('use_secure_delivery_option')
    }
    
    validationResult.approved = validationResult.flags.length === 0 || validationResult.riskLevel === 'low'
    
    return validationResult
  }

  // Safe meeting point recommendations for collection orders
  getSafeMeetingPoints(area: string): SafeMeetingPoint[] {
    return [
      {
        name: 'Mall of Africa - Main Entrance',
        address: 'Waterfall City, Midrand',
        type: 'shopping_mall',
        securityLevel: 'high',
        operatingHours: '09:00-21:00',
        coordinates: { lat: -25.9927, lng: 28.1122 }
      },
      {
        name: 'Sandton City - Customer Service',
        address: 'Sandton, Johannesburg',
        type: 'shopping_mall',
        securityLevel: 'high',
        operatingHours: '09:00-21:00',
        coordinates: { lat: -26.1084, lng: 28.0533 }
      }
      // More safe meeting points
    ]
  }
}

interface OrderValidationResult {
  approved: boolean
  riskLevel: 'low' | 'medium' | 'high'
  flags: string[]
  requiredActions: string[]
  escrowRecommended: boolean
}

interface SafeMeetingPoint {
  name: string
  address: string
  type: 'shopping_mall' | 'police_station' | 'bank' | 'public_facility'
  securityLevel: 'low' | 'medium' | 'high'
  operatingHours: string
  coordinates: { lat: number, lng: number }
}
```

### 5. Escrow Service Integration

```typescript
// src/services/escrow.ts
export class EscrowService {
  async initiateEscrowTransaction(order: Order): Promise<EscrowTransaction> {
    const escrowTransaction = {
      id: generateId(),
      orderId: order.id,
      amount: order.totalValue,
      status: 'pending_deposit',
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }

    // Create secure payment link for buyer
    const paymentLink = await this.createSecurePaymentLink(escrowTransaction)
    
    // Notify buyer to deposit funds
    await this.notifyBuyerForDeposit(order.buyerId, paymentLink)
    
    return escrowTransaction
  }

  async releaseEscrowFunds(transactionId: string, releaseType: 'to_seller' | 'refund_buyer') {
    const transaction = await this.getEscrowTransaction(transactionId)
    
    if (transaction.status !== 'funds_deposited') {
      throw new Error('Cannot release funds - invalid transaction status')
    }
    
    if (releaseType === 'to_seller') {
      // Release funds to seller after successful delivery confirmation
      await this.transferToSeller(transaction)
    } else {
      // Refund to buyer in case of dispute or cancellation
      await this.refundToBuyer(transaction)
    }
    
    transaction.status = releaseType === 'to_seller' ? 'completed' : 'refunded'
    await this.updateEscrowTransaction(transaction)
  }
}

interface EscrowTransaction {
  id: string
  orderId: string
  amount: number
  status: 'pending_deposit' | 'funds_deposited' | 'completed' | 'refunded' | 'disputed'
  buyerId: string
  sellerId: string
  createdAt: string
  expiresAt: string
}
```

## Implementation Priority

### Phase 1: Basic Notification System (Week 1)
1. Real-time WebSocket notifications
2. SMS integration with Clickatell
3. Email notifications
4. Browser push notifications

### Phase 2: Basic Verification (Week 2)
1. Phone and email verification
2. Basic reputation scoring
3. Order validation system

### Phase 3: Advanced Verification (Week 3-4)
1. ID number verification
2. Social media verification
3. Bank account verification
4. Advanced reputation algorithms

### Phase 4: Safety Features (Week 5)
1. Safe meeting point recommendations
2. Escrow service integration
3. Suspicious activity detection
4. Dispute resolution system

## Security Benefits

### For Sellers:
- **Instant Order Alerts**: Never miss an order
- **Buyer Verification**: Know who you're dealing with
- **Risk Assessment**: Automatic flagging of suspicious orders
- **Secure Payments**: Escrow protection for high-value items

### For Buyers:
- **Identity Protection**: Verified seller interactions
- **Safe Transactions**: Escrow and dispute resolution
- **Secure Meetings**: Recommended safe collection points
- **Fraud Protection**: Multi-layer verification prevents scams

### For Platform:
- **Trust Building**: Verified users increase confidence
- **Fraud Prevention**: Multi-layer detection and prevention
- **Compliance**: POPIA-compliant verification processes
- **Reputation System**: Self-regulating community

This comprehensive system ensures that both buyers and sellers can transact safely while maintaining the informal, social nature that makes the platform appealing to young South African entrepreneurs.

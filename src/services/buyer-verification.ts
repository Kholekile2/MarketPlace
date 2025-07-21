// src/services/buyer-verification.ts
'use client'

export enum VerificationLevel {
  UNVERIFIED = 0,      // No verification
  BASIC = 1,           // Phone + Email verified
  STANDARD = 2,        // + ID verification
  VERIFIED = 3,        // + Address verification
  PREMIUM = 4          // + Bank account verification
}

export interface BuyerProfile {
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
  createdAt: string
}

export interface Address {
  street: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface SocialVerificationResult {
  platform: string
  profileUrl: string
  verified: boolean
  accountAge: number
  followerCount: number
  postCount: number
  riskScore: number
  flags: string[]
}

export interface OrderValidationResult {
  approved: boolean
  riskLevel: 'low' | 'medium' | 'high'
  flags: string[]
  requiredActions: string[]
  escrowRecommended: boolean
  reasoning: string
}

export interface SafeMeetingPoint {
  name: string
  address: string
  type: 'shopping_mall' | 'police_station' | 'bank' | 'public_facility'
  securityLevel: 'low' | 'medium' | 'high'
  operatingHours: string
  coordinates: { lat: number, lng: number }
  verified: boolean
}

export class BuyerVerificationService {
  private static instance: BuyerVerificationService

  static getInstance(): BuyerVerificationService {
    if (!BuyerVerificationService.instance) {
      BuyerVerificationService.instance = new BuyerVerificationService()
    }
    return BuyerVerificationService.instance
  }

  // South African ID Number Validation
  validateSAIDNumber(idNumber: string): boolean {
    if (!idNumber || idNumber.length !== 13) return false
    
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

  // Extract information from SA ID Number
  extractIDInfo(idNumber: string): { dateOfBirth: Date, gender: string, citizenship: string } | null {
    if (!this.validateSAIDNumber(idNumber)) return null

    const year = parseInt(idNumber.substring(0, 2))
    const month = parseInt(idNumber.substring(2, 4))
    const day = parseInt(idNumber.substring(4, 6))
    const genderDigit = parseInt(idNumber.substring(6, 10))
    const citizenshipDigit = parseInt(idNumber.substring(10, 11))

    // Determine century (cutoff at 21 for current century)
    const fullYear = year > 21 ? 1900 + year : 2000 + year
    
    return {
      dateOfBirth: new Date(fullYear, month - 1, day),
      gender: genderDigit >= 5000 ? 'male' : 'female',
      citizenship: citizenshipDigit === 0 ? 'sa_citizen' : 'permanent_resident'
    }
  }

  // Phone number verification
  async verifyPhoneNumber(phoneNumber: string): Promise<boolean> {
    const formattedNumber = this.formatSAPhoneNumber(phoneNumber)
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    try {
      // In production, send SMS with verification code
      console.log(`Verification code for ${formattedNumber}: ${verificationCode}`)
      
      // Store verification code temporarily (in production, use Redis or database)
      this.storeVerificationCode(formattedNumber, verificationCode)
      
      return true
    } catch (error) {
      console.error('Phone verification failed:', error)
      return false
    }
  }

  private formatSAPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('0')) {
      cleaned = '27' + cleaned.substring(1)
    } else if (!cleaned.startsWith('27')) {
      cleaned = '27' + cleaned
    }
    
    return '+' + cleaned
  }

  private storeVerificationCode(phoneNumber: string, code: string) {
    if (typeof window !== 'undefined') {
      const verificationData = {
        code,
        timestamp: Date.now(),
        expires: Date.now() + 300000 // 5 minutes
      }
      localStorage.setItem(`verification_${phoneNumber}`, JSON.stringify(verificationData))
    }
  }

  // Verify the code entered by user
  async verifyCode(phoneNumber: string, enteredCode: string): Promise<boolean> {
    if (typeof window === 'undefined') return false

    const formattedNumber = this.formatSAPhoneNumber(phoneNumber)
    const storedData = localStorage.getItem(`verification_${formattedNumber}`)
    
    if (!storedData) return false

    const verificationData = JSON.parse(storedData)
    
    // Check if code has expired
    if (Date.now() > verificationData.expires) {
      localStorage.removeItem(`verification_${formattedNumber}`)
      return false
    }

    // Check if code matches
    if (verificationData.code === enteredCode) {
      localStorage.removeItem(`verification_${formattedNumber}`)
      return true
    }

    return false
  }

  // Social media verification
  async verifySocialMediaProfile(platform: string, profileUrl: string): Promise<SocialVerificationResult> {
    const verification: SocialVerificationResult = {
      platform,
      profileUrl,
      verified: false,
      accountAge: 0,
      followerCount: 0,
      postCount: 0,
      riskScore: 0,
      flags: []
    }

    try {
      // Mock verification - in production, use social media APIs
      switch (platform.toLowerCase()) {
        case 'facebook':
          return this.mockFacebookVerification(verification)
        case 'instagram':
          return this.mockInstagramVerification(verification)
        case 'tiktok':
          return this.mockTikTokVerification(verification)
        default:
          verification.flags.push('unsupported_platform')
          verification.riskScore = 50
      }
    } catch (error) {
      verification.flags.push('verification_failed')
      verification.riskScore = 100
    }

    return verification
  }

  private mockFacebookVerification(verification: SocialVerificationResult): SocialVerificationResult {
    // Mock data - in production, use Facebook Graph API
    verification.accountAge = Math.floor(Math.random() * 2000) + 30 // 30-2030 days
    verification.followerCount = Math.floor(Math.random() * 1000) + 10
    verification.postCount = Math.floor(Math.random() * 200) + 5

    // Calculate risk score
    if (verification.accountAge < 30) {
      verification.flags.push('new_account')
      verification.riskScore += 30
    }

    if (verification.followerCount < 50) {
      verification.flags.push('low_friend_count')
      verification.riskScore += 25
    }

    if (verification.postCount < 10) {
      verification.flags.push('inactive_account')
      verification.riskScore += 20
    }

    verification.verified = verification.riskScore < 40
    return verification
  }

  private mockInstagramVerification(verification: SocialVerificationResult): SocialVerificationResult {
    verification.accountAge = Math.floor(Math.random() * 1500) + 60
    verification.followerCount = Math.floor(Math.random() * 2000) + 20
    verification.postCount = Math.floor(Math.random() * 500) + 10

    if (verification.accountAge < 90) {
      verification.flags.push('new_account')
      verification.riskScore += 25
    }

    if (verification.followerCount < 100) {
      verification.flags.push('low_follower_count')
      verification.riskScore += 20
    }

    verification.verified = verification.riskScore < 35
    return verification
  }

  private mockTikTokVerification(verification: SocialVerificationResult): SocialVerificationResult {
    verification.accountAge = Math.floor(Math.random() * 800) + 30
    verification.followerCount = Math.floor(Math.random() * 5000) + 50
    verification.postCount = Math.floor(Math.random() * 100) + 5

    if (verification.accountAge < 60) {
      verification.flags.push('new_account')
      verification.riskScore += 20
    }

    verification.verified = verification.riskScore < 30
    return verification
  }

  // Calculate reputation score
  calculateReputationScore(buyer: BuyerProfile): number {
    let score = 50 // Start with neutral score

    // Order history factors
    if (buyer.orderHistory.totalOrders > 0) {
      const successRate = buyer.orderHistory.successfulOrders / buyer.orderHistory.totalOrders
      score += (successRate - 0.5) * 60 // +/-30 points based on success rate

      // Dispute rate penalty
      const disputeRate = buyer.orderHistory.disputedOrders / buyer.orderHistory.totalOrders
      score -= disputeRate * 40
    }

    // Verification level bonus
    score += buyer.verification.level * 10

    // Social media verification
    if (buyer.verification.socialMediaVerified) {
      score += 15
    }

    // ID verification bonus
    if (buyer.verification.idVerified) {
      score += 20
    }

    // Account age bonus
    const accountAgeMonths = this.getAccountAgeInMonths(buyer.createdAt)
    score += Math.min(accountAgeMonths * 2, 20)

    // Keep score between 0-100
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private getAccountAgeInMonths(createdAt: string): number {
    const created = new Date(createdAt)
    const now = new Date()
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30))
  }

  // Order validation
  async validateOrder(order: any, buyer: BuyerProfile): Promise<OrderValidationResult> {
    const result: OrderValidationResult = {
      approved: false,
      riskLevel: 'low',
      flags: [],
      requiredActions: [],
      escrowRecommended: false,
      reasoning: ''
    }

    // Check buyer reputation
    const reputationScore = this.calculateReputationScore(buyer)
    
    if (reputationScore < 30) {
      result.riskLevel = 'high'
      result.flags.push('low_reputation_buyer')
      result.escrowRecommended = true
      result.requiredActions.push('Use escrow service for payment protection')
    }

    // Check verification level
    if (order.totalValue > 2000 && buyer.verification.level < VerificationLevel.STANDARD) {
      result.flags.push('insufficient_verification_for_amount')
      result.requiredActions.push('Complete ID verification for orders over R 2,000')
      result.riskLevel = 'medium'
    }

    // Check order value vs history
    if (buyer.orderHistory.totalOrders > 0) {
      const avgOrderValue = buyer.orderHistory.averageOrderValue
      if (order.totalValue > avgOrderValue * 5) {
        result.flags.push('unusually_high_order_value')
        result.requiredActions.push('Verify payment method')
        result.riskLevel = result.riskLevel === 'high' ? 'high' : 'medium'
      }
    }

    // New buyer checks
    if (buyer.orderHistory.totalOrders === 0) {
      if (order.totalValue > 1000) {
        result.flags.push('new_buyer_high_value')
        result.requiredActions.push('Start with smaller orders to build trust')
        result.riskLevel = 'medium'
      }
    }

    // Generate reasoning
    result.reasoning = this.generateValidationReasoning(result, reputationScore, buyer)
    
    // Final approval decision
    result.approved = result.flags.length === 0 || 
                     (result.riskLevel === 'low' && result.flags.length <= 1) ||
                     (result.riskLevel === 'medium' && buyer.verification.level >= VerificationLevel.STANDARD)

    return result
  }

  private generateValidationReasoning(result: OrderValidationResult, reputationScore: number, buyer: BuyerProfile): string {
    if (result.approved && result.flags.length === 0) {
      return `Order approved. Buyer has ${reputationScore}% reputation score and ${buyer.orderHistory.successfulOrders} successful orders.`
    }

    if (result.riskLevel === 'high') {
      return `High risk order. Buyer reputation: ${reputationScore}%. Recommend escrow payment and ID verification.`
    }

    if (result.riskLevel === 'medium') {
      return `Medium risk order. Additional verification recommended for safer transaction.`
    }

    return `Order requires review due to: ${result.flags.join(', ')}`
  }

  // Safe meeting points in major SA cities
  getSafeMeetingPoints(city: string): SafeMeetingPoint[] {
    const meetingPoints: { [key: string]: SafeMeetingPoint[] } = {
      'johannesburg': [
        {
          name: 'Sandton City - Customer Service Desk',
          address: '83 Rivonia Rd, Sandhurst, Sandton, 2196',
          type: 'shopping_mall',
          securityLevel: 'high',
          operatingHours: '09:00-21:00',
          coordinates: { lat: -26.1084, lng: 28.0533 },
          verified: true
        },
        {
          name: 'Mall of Africa - Information Desk',
          address: 'Lone Creek Crescent, Waterfall City, Midrand, 1686',
          type: 'shopping_mall',
          securityLevel: 'high',
          operatingHours: '09:00-21:00',
          coordinates: { lat: -25.9927, lng: 28.1122 },
          verified: true
        },
        {
          name: 'Eastgate Shopping Centre - Main Entrance',
          address: '43 Bradford Rd, Bedfordview, 2008',
          type: 'shopping_mall',
          securityLevel: 'high',
          operatingHours: '09:00-21:00',
          coordinates: { lat: -26.1667, lng: 28.1667 },
          verified: true
        }
      ],
      'cape town': [
        {
          name: 'V&A Waterfront - Information Centre',
          address: 'Dock Rd, V&A Waterfront, Cape Town, 8001',
          type: 'shopping_mall',
          securityLevel: 'high',
          operatingHours: '09:00-21:00',
          coordinates: { lat: -33.9057, lng: 18.4219 },
          verified: true
        },
        {
          name: 'Canal Walk Shopping Centre - Customer Service',
          address: 'Century Blvd, Century City, Cape Town, 7441',
          type: 'shopping_mall',
          securityLevel: 'high',
          operatingHours: '09:00-21:00',
          coordinates: { lat: -33.8935, lng: 18.5026 },
          verified: true
        }
      ],
      'durban': [
        {
          name: 'Gateway Theatre of Shopping - Information Desk',
          address: '1 Palm Blvd, Umhlanga Ridge, Umhlanga, 4319',
          type: 'shopping_mall',
          securityLevel: 'high',
          operatingHours: '09:00-21:00',
          coordinates: { lat: -29.7284, lng: 31.0832 },
          verified: true
        }
      ]
    }

    return meetingPoints[city.toLowerCase()] || []
  }

  // Generate buyer verification badge
  getVerificationBadge(buyer: BuyerProfile): { text: string, color: string, level: string } {
    switch (buyer.verification.level) {
      case VerificationLevel.PREMIUM:
        return { text: 'Premium Verified', color: 'bg-purple-100 text-purple-800', level: 'premium' }
      case VerificationLevel.VERIFIED:
        return { text: 'Verified Buyer', color: 'bg-green-100 text-green-800', level: 'verified' }
      case VerificationLevel.STANDARD:
        return { text: 'ID Verified', color: 'bg-blue-100 text-blue-800', level: 'standard' }
      case VerificationLevel.BASIC:
        return { text: 'Basic Verified', color: 'bg-yellow-100 text-yellow-800', level: 'basic' }
      default:
        return { text: 'Unverified', color: 'bg-gray-100 text-gray-800', level: 'unverified' }
    }
  }
}

// Export singleton instance
export const buyerVerificationService = BuyerVerificationService.getInstance()

// src/services/notifications.ts
'use client'

export enum NotificationChannel {
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  IN_APP = 'in_app'
}

export interface NotificationPreferences {
  newOrder: NotificationChannel[]
  orderUpdate: NotificationChannel[]
  paymentReceived: NotificationChannel[]
  deliveryUpdate: NotificationChannel[]
  emergencyAlerts: NotificationChannel[]
}

export interface Notification {
  id: string
  type: 'new_order' | 'order_update' | 'payment_received' | 'delivery_update' | 'emergency'
  title: string
  message: string
  orderId?: string
  timestamp: string
  priority: 'low' | 'normal' | 'high'
  read: boolean
  actionUrl?: string
}

export class NotificationService {
  private static instance: NotificationService
  private socket: WebSocket | null = null
  private notifications: Notification[] = []
  private listeners: Array<(notifications: Notification[]) => void> = []

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Initialize real-time notifications
  async initialize(sellerId: string) {
    // Load existing notifications from localStorage
    this.loadNotifications()
    
    // Request notification permission
    await this.requestNotificationPermission()
    
    // Initialize WebSocket for real-time updates
    this.initializeWebSocket(sellerId)
    
    // Set up service worker for background notifications
    this.initializeServiceWorker()
  }

  private async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return Notification.permission === 'granted'
  }

  private initializeWebSocket(sellerId: string) {
    // In production, this would connect to your WebSocket server
    // For demo, we'll simulate with intervals
    this.simulateRealTimeUpdates()
  }

  private simulateRealTimeUpdates() {
    // Simulate receiving notifications every 30 seconds for demo
    setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance of notification
        this.simulateNewOrderNotification()
      }
    }, 30000)
  }

  private simulateNewOrderNotification() {
    const mockOrder = {
      id: `ORD-${Date.now()}`,
      orderNumber: `SNK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerName: ['Sipho Ndlovu', 'Nomsa Mthembu', 'Thabo Molefe', 'Lerato Khumalo'][Math.floor(Math.random() * 4)],
      product: ['Nike Air Force 1', 'Adidas Stan Smith', 'Puma RS-X', 'Jordan 1 Mid'][Math.floor(Math.random() * 4)],
      price: [1299, 1599, 1899, 2299][Math.floor(Math.random() * 4)]
    }

    this.handleNewOrder(mockOrder)
  }

  // Handle new order notification
  async handleNewOrder(order: any) {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      type: 'new_order',
      title: '🎉 New Order Received!',
      message: `Order ${order.orderNumber} from ${order.customerName} - R ${this.formatPrice(order.price)}`,
      orderId: order.id,
      timestamp: new Date().toISOString(),
      priority: 'high',
      read: false,
      actionUrl: '/dashboard/orders'
    }

    // Add to notifications list
    this.addNotification(notification)

    // Show browser notification
    await this.showBrowserNotification(notification)

    // Play notification sound
    this.playNotificationSound('high')

    // In production, also send SMS/email based on preferences
    await this.sendExternalNotifications(notification)
  }

  private addNotification(notification: Notification) {
    this.notifications.unshift(notification)
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // Save to localStorage
    this.saveNotifications()

    // Notify listeners
    this.notifyListeners()
  }

  private async showBrowserNotification(notification: Notification) {
    if (Notification.permission !== 'granted') return

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: notification.orderId || notification.id,
      requireInteraction: notification.priority === 'high'
    })

    browserNotification.onclick = () => {
      window.focus()
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl
      }
      browserNotification.close()
    }

    // Auto-close after 10 seconds for normal priority
    if (notification.priority !== 'high') {
      setTimeout(() => browserNotification.close(), 10000)
    }
  }

  private playNotificationSound(priority: 'low' | 'normal' | 'high') {
    try {
      const audio = new Audio()
      
      switch (priority) {
        case 'high':
          audio.src = '/sounds/notification-high.mp3'
          break
        case 'normal':
          audio.src = '/sounds/notification-normal.mp3'
          break
        case 'low':
          audio.src = '/sounds/notification-low.mp3'
          break
      }
      
      audio.volume = 0.5
      audio.play().catch(console.error)
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }

  private async sendExternalNotifications(notification: Notification) {
    // In production, check user preferences and send via SMS/Email/WhatsApp
    console.log('Would send external notifications:', notification)
    
    // Example SMS (would use actual SMS service)
    // if (userPreferences.includes('sms')) {
    //   await this.smsService.send(userPhone, notification.message)
    // }
  }

  private initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-notifications.js')
        .then(registration => {
          console.log('Notification service worker registered:', registration)
        })
        .catch(error => {
          console.error('Service worker registration failed:', error)
        })
    }
  }

  // Public methods for components
  getNotifications(): Notification[] {
    return this.notifications
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveNotifications()
      this.notifyListeners()
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true)
    this.saveNotifications()
    this.notifyListeners()
  }

  clearAll() {
    this.notifications = []
    this.saveNotifications()
    this.notifyListeners()
  }

  // Subscribe to notification updates
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications))
  }

  private saveNotifications() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketplace_notifications', JSON.stringify(this.notifications))
    }
  }

  private loadNotifications() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('marketplace_notifications')
      if (saved) {
        this.notifications = JSON.parse(saved)
      }
    }
  }

  private formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()

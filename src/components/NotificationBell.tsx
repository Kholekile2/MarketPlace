// src/components/NotificationBell.tsx
'use client'

import { useState, useEffect } from 'react'
import { BellIcon, XIcon, CheckIcon, ClockIcon } from 'lucide-react'
import { notificationService, Notification } from '../services/notifications'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize('current-seller-id')

    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications)
      setUnreadCount(notificationService.getUnreadCount())
    })

    // Load initial data
    setNotifications(notificationService.getNotifications())
    setUnreadCount(notificationService.getUnreadCount())

    return unsubscribe
  }, [])

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId)
  }

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead()
  }

  const handleClearAll = () => {
    notificationService.clearAll()
    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return '🛒'
      case 'payment_received':
        return '💰'
      case 'delivery_update':
        return '🚚'
      case 'order_update':
        return '📦'
      default:
        return '🔔'
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-xs">You'll see order updates here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    handleMarkAsRead(notification.id)
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium text-gray-900 ${
                          !notification.read ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {getTimeAgo(notification.timestamp)}
                        {notification.priority === 'high' && (
                          <span className="ml-2 bg-red-100 text-red-800 px-1 py-0.5 rounded text-xs font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  View all in dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Quick notification toast component
export function NotificationToast({ 
  notification, 
  onDismiss 
}: { 
  notification: Notification
  onDismiss: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slide-in">
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0">
          {notification.type === 'new_order' ? '🛒' : '🔔'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          {notification.actionUrl && (
            <button
              onClick={() => window.location.href = notification.actionUrl!}
              className="text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              View Order →
            </button>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// CSS for animation (add to globals.css)
export const notificationStyles = `
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
`

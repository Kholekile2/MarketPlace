'use client'

import { useState } from 'react'
import { 
  TrendingUpIcon, 
  UsersIcon, 
  CreditCardIcon, 
  ShoppingBagIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react'

const stats = [
  {
    name: 'Total Revenue',
    value: 'R 45,231',
    change: '+12.5%',
    changeType: 'increase',
    icon: TrendingUpIcon,
  },
  {
    name: 'Active Customers',
    value: '127',
    change: '+8.2%',
    changeType: 'increase',
    icon: UsersIcon,
  },
  {
    name: 'Pending Invoices',
    value: '23',
    change: '-3.1%',
    changeType: 'decrease',
    icon: CreditCardIcon,
  },
  {
    name: 'Orders This Month',
    value: '89',
    change: '+15.3%',
    changeType: 'increase',
    icon: ShoppingBagIcon,
  },
]

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Nomsa Mthembu',
    product: 'Brazilian Weave 22"',
    amount: 'R 850',
    status: 'Delivered',
    date: '2025-01-18',
  },
  {
    id: 'ORD-002',
    customer: 'Thabo Mokoena',
    product: 'iPhone 13 Case',
    amount: 'R 320',
    status: 'In Transit',
    date: '2025-01-17',
  },
  {
    id: 'ORD-003',
    customer: 'Lerato Dlamini',
    product: 'Designer Dress',
    amount: 'R 1,200',
    status: 'Processing',
    date: '2025-01-16',
  },
  {
    id: 'ORD-004',
    customer: 'Mpho Radebe',
    product: 'Personal Loan',
    amount: 'R 5,000',
    status: 'Approved',
    date: '2025-01-15',
  },
]

export default function Dashboard() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={
                        stat.changeType === 'increase'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {stat.change}
                    </span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="card hover:shadow-lg transition-shadow cursor-pointer text-center">
              <PlusIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900">Create Contract</h3>
              <p className="text-xs text-gray-500 mt-1">Generate a new sales contract</p>
            </button>
            
            <button className="card hover:shadow-lg transition-shadow cursor-pointer text-center">
              <PlusIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900">Send Invoice</h3>
              <p className="text-xs text-gray-500 mt-1">Create and send an invoice</p>
            </button>
            
            <button className="card hover:shadow-lg transition-shadow cursor-pointer text-center">
              <PlusIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900">Add Customer</h3>
              <p className="text-xs text-gray-500 mt-1">Add a new customer</p>
            </button>
            
            <button className="card hover:shadow-lg transition-shadow cursor-pointer text-center">
              <PlusIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900">Track Order</h3>
              <p className="text-xs text-gray-500 mt-1">Update order status</p>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </button>
          </div>
          
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

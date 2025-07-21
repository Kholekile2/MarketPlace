'use client'

import { useState } from 'react'
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  DollarSignIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  FileTextIcon,
  CalendarIcon,
  BarChart3Icon
} from 'lucide-react'

interface AnalyticsData {
  totalRevenue: number
  revenueGrowth: number
  totalOrders: number
  ordersGrowth: number
  totalCustomers: number
  customersGrowth: number
  totalContracts: number
  contractsGrowth: number
}

// Mock analytics data
const analyticsData: AnalyticsData = {
  totalRevenue: 45680.50,
  revenueGrowth: 12.5,
  totalOrders: 186,
  ordersGrowth: 8.2,
  totalCustomers: 89,
  customersGrowth: 15.7,
  totalContracts: 42,
  contractsGrowth: -2.1
}

const monthlyRevenue = [
  { month: 'Jan', revenue: 32000 },
  { month: 'Feb', revenue: 35000 },
  { month: 'Mar', revenue: 38000 },
  { month: 'Apr', revenue: 41000 },
  { month: 'May', revenue: 39000 },
  { month: 'Jun', revenue: 45000 },
  { month: 'Jul', revenue: 48000 }
]

const topProducts = [
  { name: 'iPhone 14 Pro', sales: 45, revenue: 67500 },
  { name: 'Samsung Galaxy S24', sales: 32, revenue: 48000 },
  { name: 'Premium Hair Weaves', sales: 28, revenue: 14000 },
  { name: 'Designer Clothing', sales: 22, revenue: 33000 },
  { name: 'Loan Services', sales: 18, revenue: 27000 }
]

const recentActivity = [
  { type: 'order', description: 'New order from Thabo Mthembu', amount: 2500, time: '2 hours ago' },
  { type: 'contract', description: 'Service contract signed with Nomsa Ndlovu', amount: 0, time: '5 hours ago' },
  { type: 'invoice', description: 'Invoice paid by Sipho Khumalo', amount: 1800, time: '1 day ago' },
  { type: 'customer', description: 'New customer registered from Instagram', amount: 0, time: '2 days ago' }
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    prefix = '' 
  }: { 
    title: string
    value: number
    growth: number
    icon: any
    prefix?: string 
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-blue-500" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">
              {prefix}{typeof value === 'number' ? value.toLocaleString('en-ZA', { 
                minimumFractionDigits: prefix === 'R ' ? 2 : 0 
              }) : value}
            </dd>
          </dl>
        </div>
        <div className="flex items-center">
          {growth >= 0 ? (
            <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(growth)}%
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Analytics</h1>
          <p className="text-gray-600">Track your business performance and growth</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Custom Range
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={analyticsData.totalRevenue}
          growth={analyticsData.revenueGrowth}
          icon={DollarSignIcon}
          prefix="R "
        />
        <StatCard
          title="Total Orders"
          value={analyticsData.totalOrders}
          growth={analyticsData.ordersGrowth}
          icon={ShoppingCartIcon}
        />
        <StatCard
          title="Total Customers"
          value={analyticsData.totalCustomers}
          growth={analyticsData.customersGrowth}
          icon={UsersIcon}
        />
        <StatCard
          title="Active Contracts"
          value={analyticsData.totalContracts}
          growth={analyticsData.contractsGrowth}
          icon={FileTextIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
            <BarChart3Icon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {monthlyRevenue.map((item, index) => (
              <div key={item.month} className="flex items-center">
                <div className="w-12 text-sm text-gray-500">{item.month}</div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(item.revenue / 50000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right text-sm font-medium text-gray-900">
                  R {item.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    R {product.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'order' ? 'bg-green-100' :
                  activity.type === 'contract' ? 'bg-blue-100' :
                  activity.type === 'invoice' ? 'bg-yellow-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'order' && <ShoppingCartIcon className="h-5 w-5 text-green-600" />}
                  {activity.type === 'contract' && <FileTextIcon className="h-5 w-5 text-blue-600" />}
                  {activity.type === 'invoice' && <DollarSignIcon className="h-5 w-5 text-yellow-600" />}
                  {activity.type === 'customer' && <UsersIcon className="h-5 w-5 text-purple-600" />}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
              {activity.amount > 0 && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    R {activity.amount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

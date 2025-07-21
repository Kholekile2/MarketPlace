'use client'

import { useState } from 'react'
import { PlusIcon, SearchIcon, PhoneIcon, MailIcon, MapPinIcon, UsersIcon } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  source: 'Facebook' | 'Instagram' | 'WhatsApp' | 'Manual'
}

// Mock data for demonstration
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Thabo Mthembu',
    email: 'thabo@gmail.com',
    phone: '+27 82 123 4567',
    location: 'Johannesburg, GP',
    totalOrders: 12,
    totalSpent: 4580.50,
    lastOrder: '2025-07-18',
    source: 'Instagram'
  },
  {
    id: '2',
    name: 'Nomsa Ndlovu',
    email: 'nomsa.ndlovu@gmail.com',
    phone: '+27 84 987 6543',
    location: 'Cape Town, WC',
    totalOrders: 8,
    totalSpent: 2340.00,
    lastOrder: '2025-07-19',
    source: 'Facebook'
  },
  {
    id: '3',
    name: 'Sipho Khumalo',
    email: 'sipho.k@yahoo.com',
    phone: '+27 73 456 7890',
    location: 'Durban, KZN',
    totalOrders: 15,
    totalSpent: 6750.25,
    lastOrder: '2025-07-20',
    source: 'WhatsApp'
  }
]

const sourceColors = {
  Facebook: 'bg-blue-100 text-blue-800',
  Instagram: 'bg-pink-100 text-pink-800',
  WhatsApp: 'bg-green-100 text-green-800',
  Manual: 'bg-gray-100 text-gray-800'
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Management</h1>
        <p className="text-gray-600">Manage your customer database and import from social media</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Customer
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Import from Social Media
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Total Customers</p>
              <p className="text-2xl font-bold text-blue-900">{customers.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-600">Active This Month</p>
              <p className="text-2xl font-bold text-green-900">{customers.filter(c => new Date(c.lastOrder) > new Date('2025-07-01')).length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-600">Average Orders</p>
              <p className="text-2xl font-bold text-purple-900">{Math.round(customers.reduce((acc, c) => acc + c.totalOrders, 0) / customers.length)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-orange-600">Total Revenue</p>
              <p className="text-2xl font-bold text-orange-900">R {customers.reduce((acc, c) => acc + c.totalSpent, 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Order
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">ID: {customer.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <MailIcon className="h-3 w-3 mr-1 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" />
                      {customer.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    R {customer.totalSpent.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${sourceColors[customer.source]}`}>
                      {customer.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.lastOrder).toLocaleDateString('en-ZA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
            </p>
          </div>
        )}
      </div>

      {/* Add Customer Form Modal - You can implement this as needed */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Customer</h3>
              <p className="text-sm text-gray-500 mb-4">Customer form functionality can be implemented here.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

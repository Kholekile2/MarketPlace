'use client'

import { useState } from 'react'
import { CreditCardIcon, DownloadIcon, SendIcon, PlusIcon, EyeIcon } from 'lucide-react'

interface Invoice {
  id: string
  customerName: string
  amount: string
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue'
  dueDate: string
  createdDate: string
  items: Array<{
    description: string
    quantity: number
    price: number
  }>
}

const existingInvoices: Invoice[] = [
  {
    id: 'INV-001',
    customerName: 'Nomsa Mthembu',
    amount: 'R 850',
    status: 'Paid',
    dueDate: '2025-01-20',
    createdDate: '2025-01-10',
    items: [{ description: 'Brazilian Weave 22"', quantity: 1, price: 850 }]
  },
  {
    id: 'INV-002',
    customerName: 'Thabo Mokoena',
    amount: 'R 320',
    status: 'Sent',
    dueDate: '2025-01-25',
    createdDate: '2025-01-15',
    items: [{ description: 'iPhone 13 Case', quantity: 1, price: 320 }]
  },
  {
    id: 'INV-003',
    customerName: 'Mpho Radebe',
    amount: 'R 5,000',
    status: 'Overdue',
    dueDate: '2025-01-18',
    createdDate: '2025-01-05',
    items: [{ description: 'Personal Loan Processing Fee', quantity: 1, price: 5000 }]
  }
]

export default function InvoicesPage() {
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>(existingInvoices)
  const [newInvoice, setNewInvoice] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    dueDate: '',
    notes: '',
    items: [{ description: '', quantity: 1, price: 0 }]
  })

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, price: 0 }]
    })
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = newInvoice.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setNewInvoice({ ...newInvoice, items: updatedItems })
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = newInvoice.items.filter((_, i) => i !== index)
    setNewInvoice({ ...newInvoice, items: updatedItems })
  }

  const calculateTotal = () => {
    return newInvoice.items.reduce((total, item) => total + (item.quantity * item.price), 0)
  }

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault()
    
    const total = calculateTotal()
    const invoice: Invoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      customerName: newInvoice.customerName,
      amount: `R ${total.toLocaleString()}`,
      status: 'Draft',
      dueDate: newInvoice.dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      items: newInvoice.items.filter(item => item.description.trim() !== '')
    }
    
    setInvoices([...invoices, invoice])
    setNewInvoice({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      dueDate: '',
      notes: '',
      items: [{ description: '', quantity: 1, price: 0 }]
    })
    setShowNewInvoiceForm(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Sent': return 'bg-blue-100 text-blue-800'
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create professional invoices and track payments
            </p>
          </div>
          <button
            onClick={() => setShowNewInvoiceForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Invoice
          </button>
        </div>

        {/* Invoice Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
          <div className="card">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-lg font-semibold text-gray-900">R 12,350</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-lg font-semibold text-gray-900">R 3,540</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-lg font-semibold text-gray-900">R 1,200</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-lg font-semibold text-gray-900">R 8,950</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Invoice Form */}
        {showNewInvoiceForm && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Create New Invoice</h2>
              <button
                onClick={() => setShowNewInvoiceForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={newInvoice.customerName}
                    onChange={(e) => setNewInvoice({...newInvoice, customerName: e.target.value})}
                    className="input-field"
                    placeholder="Customer name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newInvoice.customerEmail}
                    onChange={(e) => setNewInvoice({...newInvoice, customerEmail: e.target.value})}
                    className="input-field"
                    placeholder="customer@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newInvoice.customerPhone}
                    onChange={(e) => setNewInvoice({...newInvoice, customerPhone: e.target.value})}
                    className="input-field"
                    placeholder="+27 12 345 6789"
                  />
                </div>
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn-secondary text-sm"
                  >
                    Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
                      <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="input-field"
                          placeholder="Product or service description"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="input-field"
                          min="1"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (ZAR)
                        </label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                          className="input-field"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <div className="py-2 px-3 bg-gray-50 rounded-md text-sm font-medium">
                          R {(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="sm:col-span-1">
                        {newInvoice.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    Total: R {calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder="Payment terms, thank you message, etc."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary">
                  Create Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceForm(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Your Invoices</h2>
            <div className="text-sm text-gray-500">
              {invoices.length} total invoices
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.createdDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-gray-600 hover:text-gray-900" title="View">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-primary-600 hover:text-primary-900" title="Download">
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900" title="Send">
                          <SendIcon className="h-4 w-4" />
                        </button>
                      </div>
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

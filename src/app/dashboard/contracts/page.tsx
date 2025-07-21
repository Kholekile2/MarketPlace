'use client'

import { useState } from 'react'
import { FileTextIcon, DownloadIcon, SendIcon, PlusIcon } from 'lucide-react'

interface Contract {
  id: string
  customerName: string
  productService: string
  amount: string
  status: 'Draft' | 'Sent' | 'Signed' | 'Completed'
  createdDate: string
  type: 'Sale' | 'Service' | 'Loan'
}

const existingContracts: Contract[] = [
  {
    id: 'CON-001',
    customerName: 'Nomsa Mthembu',
    productService: 'Brazilian Weave Bundle',
    amount: 'R 2,500',
    status: 'Signed',
    createdDate: '2025-01-15',
    type: 'Sale'
  },
  {
    id: 'CON-002',
    customerName: 'Thabo Mokoena',
    productService: 'Personal Loan Agreement',
    amount: 'R 5,000',
    status: 'Sent',
    createdDate: '2025-01-14',
    type: 'Loan'
  },
  {
    id: 'CON-003',
    customerName: 'Lerato Dlamini',
    productService: 'Fashion Design Service',
    amount: 'R 1,800',
    status: 'Draft',
    createdDate: '2025-01-13',
    type: 'Service'
  }
]

export default function ContractsPage() {
  const [showNewContractForm, setShowNewContractForm] = useState(false)
  const [contracts, setContracts] = useState<Contract[]>(existingContracts)
  const [newContract, setNewContract] = useState({
    customerName: '',
    productService: '',
    amount: '',
    type: 'Sale' as const,
    paymentTerms: '30',
    deliveryDate: '',
    description: ''
  })

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault()
    
    const contract: Contract = {
      id: `CON-${String(contracts.length + 1).padStart(3, '0')}`,
      customerName: newContract.customerName,
      productService: newContract.productService,
      amount: `R ${newContract.amount}`,
      status: 'Draft',
      createdDate: new Date().toISOString().split('T')[0],
      type: newContract.type
    }
    
    setContracts([...contracts, contract])
    setNewContract({
      customerName: '',
      productService: '',
      amount: '',
      type: 'Sale',
      paymentTerms: '30',
      deliveryDate: '',
      description: ''
    })
    setShowNewContractForm(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Sent': return 'bg-blue-100 text-blue-800'
      case 'Signed': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage professional contracts for your business
            </p>
          </div>
          <button
            onClick={() => setShowNewContractForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Contract
          </button>
        </div>

        {/* Contract Templates */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Templates</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <FileTextIcon className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Product Sales Contract</h3>
                <p className="text-sm text-gray-500 mb-4">
                  For selling weaves, phones, clothing, and other products
                </p>
                <button className="btn-primary w-full">Use Template</button>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <FileTextIcon className="h-12 w-12 text-secondary-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Service Agreement</h3>
                <p className="text-sm text-gray-500 mb-4">
                  For styling, consultation, and other services
                </p>
                <button className="btn-secondary w-full">Use Template</button>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <FileTextIcon className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loan Agreement</h3>
                <p className="text-sm text-gray-500 mb-4">
                  For personal loans with clear terms and repayment schedule
                </p>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors w-full">
                  Use Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* New Contract Form */}
        {showNewContractForm && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Create New Contract</h2>
              <button
                onClick={() => setShowNewContractForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateContract} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={newContract.customerName}
                    onChange={(e) => setNewContract({...newContract, customerName: e.target.value})}
                    className="input-field"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Type
                  </label>
                  <select
                    value={newContract.type}
                    onChange={(e) => setNewContract({...newContract, type: e.target.value as 'Sale' | 'Service' | 'Loan'})}
                    className="input-field"
                  >
                    <option value="Sale">Product Sale</option>
                    <option value="Service">Service Agreement</option>
                    <option value="Loan">Loan Agreement</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product/Service
                  </label>
                  <input
                    type="text"
                    value={newContract.productService}
                    onChange={(e) => setNewContract({...newContract, productService: e.target.value})}
                    className="input-field"
                    placeholder="What are you selling/providing?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (ZAR)
                  </label>
                  <input
                    type="number"
                    value={newContract.amount}
                    onChange={(e) => setNewContract({...newContract, amount: e.target.value})}
                    className="input-field"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms (Days)
                  </label>
                  <select
                    value={newContract.paymentTerms}
                    onChange={(e) => setNewContract({...newContract, paymentTerms: e.target.value})}
                    className="input-field"
                  >
                    <option value="0">Payment on delivery</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery/Completion Date
                  </label>
                  <input
                    type="date"
                    value={newContract.deliveryDate}
                    onChange={(e) => setNewContract({...newContract, deliveryDate: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Terms & Conditions
                </label>
                <textarea
                  value={newContract.description}
                  onChange={(e) => setNewContract({...newContract, description: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder="Any specific conditions, warranties, or requirements..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary">
                  Create Contract
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewContractForm(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Contracts */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Your Contracts</h2>
            <div className="text-sm text-gray-500">
              {contracts.length} total contracts
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product/Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contract.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.productService}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {contract.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.createdDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
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

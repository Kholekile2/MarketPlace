'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  TagIcon,
  PackageIcon,
  CameraIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number | null
  category?: string | null
  sizes: string[]
  stockQuantity: number
  isVisible: boolean
  images: string[]
}

// Helper function for consistent price formatting
const formatPrice = (price: number): string => {
  if (isNaN(price)) return '0'
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function ProductsManagement() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products ?? [])
      }
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Sneakers',
    sizes: [] as string[],
    stockQuantity: '',
    isVisible: true,
  })

  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const [showImageGallery, setShowImageGallery] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const totalImages = existingImages.length + selectedImages.length + files.length
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed per product')
      return
    }
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    setSelectedImages((prev) => [...prev, ...files])
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])
  }

  const removeImage = (index: number, isExisting = false) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index))
    } else {
      URL.revokeObjectURL(imagePreviewUrls[index])
      setSelectedImages((prev) => prev.filter((_, i) => i !== index))
      setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const openImageGallery = (images: string[], startIndex = 0) => {
    setGalleryImages(images)
    setCurrentImageIndex(startIndex)
    setShowImageGallery(true)
  }

  const closeImageGallery = () => {
    setShowImageGallery(false)
    setGalleryImages([])
    setCurrentImageIndex(0)
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  const previousImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)

  const filteredProducts = products.filter((product) => {
    if (filter === 'all') return true
    if (filter === 'visible') return product.isVisible
    if (filter === 'hidden') return !product.isVisible
    if (filter === 'in-stock') return product.stockQuantity > 0
    if (filter === 'out-of-stock') return product.stockQuantity <= 0
    return true
  })

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'Sneakers',
      sizes: [],
      stockQuantity: '',
      isVisible: true,
    })
    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    setSelectedImages([])
    setImagePreviewUrls([])
    setExistingImages([])
    setEditingProduct(null)
    setShowAddForm(false)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category || 'Sneakers',
      sizes: product.sizes,
      stockQuantity: product.stockQuantity.toString(),
      isVisible: product.isVisible,
    })
    setExistingImages(product.images || [])
    setSelectedImages([])
    setImagePreviewUrls([])
    setShowAddForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newImageBase64s = await Promise.all(selectedImages.map((file) => fileToBase64(file)))
      const allImages = [...existingImages, ...newImageBase64s]

      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        category: productForm.category,
        sizes: productForm.sizes,
        stockQuantity: parseInt(productForm.stockQuantity) || 0,
        images: allImages,
        isVisible: productForm.isVisible,
      }

      let res: Response
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
      }

      if (res.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product added!')
        await loadProducts()
        resetForm()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save product')
      }
    } catch {
      toast.error('Error saving product. Please try again.')
    }
  }

  const toggleVisibility = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !product.isVisible }),
    })
    if (res.ok) {
      await loadProducts()
      toast.success('Visibility updated')
    } else {
      toast.error('Failed to update visibility')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
    if (res.ok) {
      await loadProducts()
      toast.success('Product deleted')
    } else {
      toast.error('Failed to delete product')
    }
  }

  const addSize = (size: string) => {
    if (size && !productForm.sizes.includes(size)) {
      setProductForm({ ...productForm, sizes: [...productForm.sizes, size] })
    }
  }

  const removeSize = (size: string) => {
    setProductForm({ ...productForm, sizes: productForm.sizes.filter((s) => s !== size) })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Catalog</h1>
            <p className="text-gray-600">
              Manage your products that appear on your public storefront
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {session?.user?.username && (
              <a
                href={`/business/${session.user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview Storefront
              </a>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <PackageIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="ml-3 text-sm text-blue-700">
              <strong className="text-blue-800">How it works: </strong>
              Add products with photos and pricing. Toggle visibility to control what customers
              see. Set stock quantities — products auto-hide when sold out. Share your storefront
              link on Instagram, TikTok, and WhatsApp.
            </div>
          </div>
        </div>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PackageIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Visible</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.filter((p) => p.isVisible).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.filter((p) => p.stockQuantity > 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg. Price</p>
              <p className="text-2xl font-semibold text-gray-900">
                {products.length > 0
                  ? `R ${formatPrice(Math.round(products.reduce((s, p) => s + p.price, 0) / products.length))}`
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {[
              { key: 'all', label: 'All', count: products.length },
              { key: 'visible', label: 'Visible', count: products.filter((p) => p.isVisible).length },
              { key: 'hidden', label: 'Hidden', count: products.filter((p) => !p.isVisible).length },
              { key: 'in-stock', label: 'In Stock', count: products.filter((p) => p.stockQuantity > 0).length },
              {
                key: 'out-of-stock',
                label: 'Out of Stock',
                count: products.filter((p) => p.stockQuantity <= 0).length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-200 relative">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openImageGallery(product.images, 0)}
                    />
                    {product.images.length > 1 && (
                      <button
                        onClick={() => openImageGallery(product.images, 0)}
                        className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded hover:bg-opacity-70"
                      >
                        +{product.images.length - 1} more
                      </button>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <CameraIcon className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {!product.isVisible && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Hidden
                    </span>
                  )}
                  {product.stockQuantity <= 0 && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      R {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        R {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">Stock: {product.stockQuantity}</span>
                </div>

                {product.sizes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.sizes.slice(0, 4).map((size) => (
                      <span
                        key={size}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {size}
                      </span>
                    ))}
                    {product.sizes.length > 4 && (
                      <span className="text-xs text-gray-500">+{product.sizes.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleVisibility(product)}
                      className={`p-2 rounded ${
                        product.isVisible
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      title={product.isVisible ? 'Hide' : 'Show'}
                    >
                      {product.isVisible ? (
                        <EyeIcon className="h-4 w-4" />
                      ) : (
                        <EyeOffIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">{product.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? 'Get started by adding your first product!'
              : `No ${filter.replace('-', ' ')} products.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Product
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white my-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Nike Air Force 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Sneakers">Sneakers</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Describe your product..."
                />
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Max 5)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 mb-3">
                  <div className="text-center">
                    <CameraIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <label className="cursor-pointer">
                      <span className="block text-sm font-medium text-gray-900">
                        Upload product images
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">
                        PNG, JPG up to 10MB each
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <span className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Choose Files
                      </span>
                    </label>
                  </div>
                </div>

                {(existingImages.length > 0 || imagePreviewUrls.length > 0) && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {imagePreviewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img src={url} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index, false)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                          New
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (R) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="1899"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price (R)
                  </label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, originalPrice: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="2199"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Qty *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQuantity}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stockQuantity: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="10"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {productForm.sizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12'].map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => addSize(size)}
                        disabled={productForm.sizes.includes(size)}
                        className={`px-3 py-1 text-sm rounded ${
                          productForm.sizes.includes(size)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={productForm.isVisible}
                  onChange={(e) =>
                    setProductForm({ ...productForm, isVisible: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Make product visible on storefront
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center p-4">
            <button
              onClick={closeImageGallery}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XIcon className="h-8 w-8" />
            </button>
            {galleryImages.length > 1 && (
              <button
                onClick={previousImage}
                className="absolute left-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeftIcon className="h-12 w-12" />
              </button>
            )}
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={galleryImages[currentImageIndex]}
                alt={`Product image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {galleryImages.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronRightIcon className="h-12 w-12" />
              </button>
            )}
            {galleryImages.length > 1 && (
              <>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                  {currentImageIndex + 1} of {galleryImages.length}
                </div>
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-2">
                  {galleryImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-12 h-12 rounded overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-white' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

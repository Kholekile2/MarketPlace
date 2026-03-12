'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  ShoppingCartIcon,
  MapPinIcon,
  PhoneIcon,
  InstagramIcon,
  MessageCircleIcon,
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

interface Business {
  businessName: string
  name: string
  username: string
  whatsapp?: string | null
  instagramHandle?: string | null
  tiktokHandle?: string | null
  phone?: string | null
}

const formatPrice = (price: number): string =>
  price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export default function BusinessStorefront({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params)

  const [business, setBusiness] = useState<Business | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    phone: '',
    size: '',
    deliveryAddress: '',
    notes: '',
  })
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const loadStorefront = async () => {
      try {
        const res = await fetch(`/api/storefront/${username}`)
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        if (res.ok) {
          const data = await res.json()
          setBusiness(data.business)
          setProducts(data.products)
        } else {
          // 503 or other server errors — show a generic error via notFound
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    loadStorefront()
  }, [username])

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product)
    setOrderForm({ customerName: '', phone: '', size: '', deliveryAddress: '', notes: '' })
    setShowOrderForm(true)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !business) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerUsername: username,
          customerName: orderForm.customerName,
          customerPhone: orderForm.phone,
          productName: selectedProduct.name,
          size: orderForm.size || null,
          price: selectedProduct.price,
          deliveryAddress: orderForm.deliveryAddress,
          notes: orderForm.notes || null,
        }),
      })
      if (res.ok) {
        toast.success('Order submitted! The seller will contact you to confirm.')
        setShowOrderForm(false)
        setSelectedProduct(null)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to submit order. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading store...</p>
        </div>
      </div>
    )
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-500 mb-6">
            The store <strong>@{username}</strong> does not exist.
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to SA Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            SA Marketplace
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{business.businessName}</h1>
              {business.phone && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                  <span className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    South Africa
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Chat on WhatsApp
                </a>
              )}
              <div className="flex items-center gap-3">
                {business.instagramHandle && (
                  <a
                    href={`https://instagram.com/${business.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-pink-600 hover:text-pink-700 text-sm"
                  >
                    <InstagramIcon className="h-4 w-4 mr-1" />
                    {business.instagramHandle}
                  </a>
                )}
                {business.tiktokHandle && (
                  <a
                    href={`https://tiktok.com/${business.tiktokHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-gray-900 text-sm"
                  >
                    <MessageCircleIcon className="h-4 w-4 mr-1" />
                    {business.tiktokHandle}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {products.length > 0 ? (
            products.map((product) => (
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
                          className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded hover:bg-opacity-70"
                        >
                          +{product.images.length - 1} more
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>

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
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.stockQuantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {product.stockQuantity > 0 && (
                    <button
                      onClick={() => handleOrderClick(product)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                      Order Now
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products listed yet</h3>
              <p className="text-gray-500">Check back soon for new items!</p>
            </div>
          )}
        </div>

        {/* How to Order + Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3">How to Order</h3>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>Click &quot;Order Now&quot; on any in-stock product</li>
              <li>Fill in your name, phone and delivery address</li>
              <li>The seller will contact you to confirm payment and delivery details</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <PhoneIcon className="h-5 w-5 mr-2 text-green-600" />
              Contact Seller
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Questions? Chat directly with the seller on WhatsApp.
            </p>
            {business.whatsapp ? (
              <a
                href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Chat on WhatsApp
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">No WhatsApp number provided.</p>
            )}
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white my-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Order: {selectedProduct.name}</h3>
              <button
                onClick={() => setShowOrderForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                  <select
                    required
                    value={orderForm.size}
                    onChange={(e) => setOrderForm({ ...orderForm, size: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Choose size</option>
                    {selectedProduct.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="+27 82 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={orderForm.deliveryAddress}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, deliveryAddress: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Full delivery address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Any special requests"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-900">
                  Total: R {formatPrice(selectedProduct.price)}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  The seller will contact you to confirm payment and delivery details.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Order'}
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
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
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

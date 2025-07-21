'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShoppingCartIcon, 
  StarIcon, 
  TruckIcon, 
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon,
  CreditCardIcon,
  PhoneIcon,
  InstagramIcon,
  MessageCircleIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react'
import { getSellerProducts, Product } from '@/utils/productsStore'

// Mock data for Thandi's sneaker business
const businessProfile = {
  businessName: "Thandi's Sneaker Empire",
  ownerName: "Thandi Mthembu",
  description: "Premium sneakers for the streets of Johannesburg. Authentic brands, competitive prices, and fast delivery!",
  location: "Johannesburg, Gauteng",
  rating: 4.8,
  totalReviews: 127,
  verified: true,
  socialMedia: {
    instagram: "@thandisneakers",
    tiktok: "@thandisneakers_za"
  },
  deliveryOptions: ["PAXI", "RAM Couriers", "Collection"],
  paymentMethods: ["SnapScan", "EFT", "Cash on Collection"],
  businessHours: "Mon-Fri: 9AM-6PM, Sat: 9AM-4PM"
}

// Helper function for consistent price formatting (avoiding hydration mismatch)
const formatPrice = (price: number): string => {
  // Use a simple approach that works consistently on server and client
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function BusinessProfilePage({ params }: { params: Promise<{ username: string }> }) {
  // Unwrap the params Promise using React.use()
  const { username } = use(params)
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedSize, setSelectedSize] = useState('')
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    deliveryOption: '',
    paymentMethod: '',
    specialInstructions: ''
  })

  const [showOrderForm, setShowOrderForm] = useState(false)

  // State for image gallery modal
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Ensure we're on the client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
    // Load products on client side only to prevent hydration mismatch
    const loadedProducts = getSellerProducts(username)
    setProducts(loadedProducts)
  }, [username])

  const handleOrderClick = (product: any) => {
    setSelectedProduct(product)
    setShowOrderForm(true)
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault()
    // This would normally integrate with the backend
    alert(`Order submitted for ${selectedProduct.name} (Size ${selectedSize}). Thandi will receive the notification!`)
    setShowOrderForm(false)
  }

  // Image gallery functions
  const openImageGallery = (images: string[], startIndex: number = 0) => {
    setGalleryImages(images)
    setCurrentImageIndex(startIndex)
    setShowImageGallery(true)
  }

  const closeImageGallery = () => {
    setShowImageGallery(false)
    setGalleryImages([])
    setCurrentImageIndex(0)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold text-gray-900">
              SA Marketplace
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ShieldCheckIcon className="h-4 w-4 text-green-500" />
              <span>Verified Business</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-900 mr-3">
                  {businessProfile.businessName}
                </h1>
                {businessProfile.verified && (
                  <ShieldCheckIcon className="h-6 w-6 text-green-500" />
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{businessProfile.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {businessProfile.location}
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                  {businessProfile.rating} ({businessProfile.totalReviews} reviews)
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {businessProfile.businessHours}
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-6">
              <div className="flex flex-col space-y-2">
                <a 
                  href={`https://instagram.com/${businessProfile.socialMedia.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-pink-600 hover:text-pink-700"
                >
                  <InstagramIcon className="h-4 w-4 mr-2" />
                  {businessProfile.socialMedia.instagram}
                </a>
                <a 
                  href={`https://tiktok.com/${businessProfile.socialMedia.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-800 hover:text-gray-900"
                >
                  <MessageCircleIcon className="h-4 w-4 mr-2" />
                  {businessProfile.socialMedia.tiktok}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {!isClient ? (
            // Show loading skeleton on server render to prevent hydration mismatch
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
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
                      {/* Image indicator if multiple images */}
                      {product.images.length > 1 && (
                        <button
                          onClick={() => openImageGallery(product.images, 0)}
                          className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded hover:bg-opacity-70 transition-colors"
                        >
                          +{product.images.length - 1} more
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      👟 No Image
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
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
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  {product.inStock && (
                    <button
                      onClick={() => handleOrderClick(product)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                      Order Now
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Show empty state when no products available
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                👟
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-500">Check back later for new arrivals!</p>
            </div>
          )}
        </div>

        {/* Business Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2 text-blue-600" />
              Delivery Options
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {businessProfile.deliveryOptions.map((option) => (
                <li key={option}>• {option}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-green-600" />
              Payment Methods
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {businessProfile.paymentMethods.map((method) => (
                <li key={method}>• {method}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <PhoneIcon className="h-5 w-5 mr-2 text-purple-600" />
              Contact Info
            </h3>
            <p className="text-sm text-gray-600 mb-2">Business Hours:</p>
            <p className="text-sm text-gray-800">{businessProfile.businessHours}</p>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Order: {selectedProduct.name}
              </h3>
              
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Size *
                  </label>
                  <select
                    required
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Choose size</option>
                    {selectedProduct.sizes.map((size: string) => (
                      <option key={size} value={size}>Size {size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
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
                    onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="+27 82 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Option *
                  </label>
                  <select
                    required
                    value={orderForm.deliveryOption}
                    onChange={(e) => setOrderForm({...orderForm, deliveryOption: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Choose delivery method</option>
                    {businessProfile.deliveryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    value={orderForm.deliveryAddress}
                    onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Full delivery address..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={orderForm.paymentMethod}
                    onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Choose payment method</option>
                    {businessProfile.paymentMethods.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Total: {isClient ? `R ${formatPrice(selectedProduct.price)}` : `R ${selectedProduct.price}`}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    You'll receive payment instructions after submitting this order.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOrderForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Submit Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeImageGallery}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XIcon className="h-8 w-8" />
            </button>

            {/* Previous Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={previousImage}
                className="absolute left-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeftIcon className="h-12 w-12" />
              </button>
            )}

            {/* Image */}
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={galleryImages[currentImageIndex]}
                alt={`Product image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Next Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronRightIcon className="h-12 w-12" />
              </button>
            )}

            {/* Image Counter */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                {currentImageIndex + 1} of {galleryImages.length}
              </div>
            )}

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}

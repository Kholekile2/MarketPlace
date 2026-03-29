export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  sizes: string[]
  colors: string[]
  inStock: boolean
  stockQuantity: number
  images: string[]
  isVisible: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Initial mock products
const initialProducts: Product[] = [
  {
    id: 'PROD-001',
    name: 'Nike Air Force 1 White',
    description: 'Classic white sneakers, perfect for any outfit. Authentic Nike with original packaging.',
    price: 1899,
    originalPrice: 2199,
    category: 'Sneakers',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White'],
    inStock: true,
    stockQuantity: 5,
    images: ['nike-af1-1.jpg', 'nike-af1-2.jpg'],
    isVisible: true,
    tags: ['nike', 'sneakers', 'white', 'classic'],
    createdAt: '2025-07-15T10:00:00Z',
    updatedAt: '2025-07-15T10:00:00Z'
  },
  {
    id: 'PROD-002',
    name: 'Adidas Stan Smith',
    description: 'Iconic tennis shoes in green and white. Comfortable and stylish for everyday wear.',
    price: 1599,
    category: 'Sneakers',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['White/Green'],
    inStock: true,
    stockQuantity: 3,
    images: ['adidas-stan-1.jpg'],
    isVisible: true,
    tags: ['adidas', 'tennis', 'classic'],
    createdAt: '2025-07-16T14:30:00Z',
    updatedAt: '2025-07-16T14:30:00Z'
  },
  {
    id: 'PROD-003',
    name: 'Puma RS-X',
    description: 'Retro-futuristic running shoes with bold design. Limited edition colorway.',
    price: 2299,
    category: 'Sneakers',
    sizes: ['8', '9', '10', '11'],
    colors: ['Black/Blue', 'White/Red'],
    inStock: false,
    stockQuantity: 0,
    images: ['puma-rsx-1.jpg', 'puma-rsx-2.jpg'],
    isVisible: false,
    tags: ['puma', 'running', 'retro', 'limited'],
    createdAt: '2025-07-18T09:15:00Z',
    updatedAt: '2025-07-19T16:45:00Z'
  }
]

// In-memory product store (transitional state before Prisma is active)
let productStore: Product[] = [...initialProducts]

// Product store functions
export const getProducts = (): Product[] => {
  return productStore
}

export const setProducts = (products: Product[]): void => {
  productStore = products
}

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const newProduct: Product = {
    ...product,
    id: `PROD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const products = getProducts()
  const updatedProducts = [...products, newProduct]
  setProducts(updatedProducts)
  
  return newProduct
}

export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null => {
  const products = getProducts()
  const productIndex = products.findIndex(p => p.id === id)
  
  if (productIndex === -1) return null
  
  const updatedProduct: Product = {
    ...products[productIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  const updatedProducts = [...products]
  updatedProducts[productIndex] = updatedProduct
  setProducts(updatedProducts)
  
  return updatedProduct
}

export const deleteProduct = (id: string): boolean => {
  const products = getProducts()
  const filteredProducts = products.filter(p => p.id !== id)
  
  if (filteredProducts.length === products.length) return false
  
  setProducts(filteredProducts)
  return true
}

export const getVisibleProducts = (): Product[] => {
  return getProducts().filter(product => product.isVisible && product.inStock)
}

export const getSellerProducts = (username: string): Product[] => {
  // In a real app, this would filter by seller username
  // For now, return all visible products
  return getVisibleProducts()
}

import Link from 'next/link'
import { ArrowRight, FileText, CreditCard, Truck, Users, TrendingUp, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">SA Marketplace</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-primary-600">Features</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-primary-600">How It Works</Link>
              <Link href="/login" className="text-gray-600 hover:text-primary-600">Login</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Formalize Your Business,<br />
            <span className="text-primary-600">Grow Your Dreams</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Helping young South African entrepreneurs transition from informal social media selling 
            to professional business operations with contracts, invoices, and delivery tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Start Your Business Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#features" className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Business
            </h3>
            <p className="text-xl text-gray-600">
              Professional tools designed for South African entrepreneurs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <FileText className="h-12 w-12 text-primary-600 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Smart Contracts</h4>
              <p className="text-gray-600">
                Generate professional contracts for your sales, customized for South African law and your business needs.
              </p>
            </div>
            
            <div className="card">
              <CreditCard className="h-12 w-12 text-primary-600 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Professional Invoices</h4>
              <p className="text-gray-600">
                Create branded invoices with payment terms, tax calculations, and QR codes for easy customer payments.
              </p>
            </div>
            
            <div className="card">
              <Truck className="h-12 w-12 text-primary-600 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Delivery Tracking</h4>
              <p className="text-gray-600">
                Track orders from sale to delivery with SMS notifications to keep your customers informed.
              </p>
            </div>
            
            <div className="card">
              <Users className="h-12 w-12 text-primary-600 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Customer Management</h4>
              <p className="text-gray-600">
                Organize customer information, purchase history, and build lasting relationships.
              </p>
            </div>
            
            <div className="card">
              <TrendingUp className="h-12 w-12 text-primary-600 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Business Analytics</h4>
              <p className="text-gray-600">
                Track sales, popular products, and business growth with easy-to-understand reports.
              </p>
            </div>
            
            <div className="card">
              <Shield className="h-12 w-12 text-primary-600 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Secure & Compliant</h4>
              <p className="text-gray-600">
                Built with South African business regulations in mind, keeping your data safe and compliant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              From Social Media to Professional Business
            </h3>
            <p className="text-xl text-gray-600">
              Simple steps to formalize your existing business
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-3">Set Up Your Business Profile</h4>
              <p className="text-gray-600">
                Tell us about your business - what you sell, your target customers, and business goals.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-3">Import Your Existing Customers</h4>
              <p className="text-gray-600">
                Connect your social media and WhatsApp to automatically import customer data and order history.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-3">Start Managing Professionally</h4>
              <p className="text-gray-600">
                Generate contracts, send invoices, track deliveries, and grow your business with professional tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-4">SA Marketplace</h5>
              <p className="text-gray-400">
                Empowering South African entrepreneurs to build professional businesses.
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Features</h6>
              <ul className="space-y-2 text-gray-400">
                <li>Contract Generation</li>
                <li>Invoice Creation</li>
                <li>Delivery Tracking</li>
                <li>Customer Management</li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Business Resources</li>
                <li>Contact Us</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Legal</h6>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>POPIA Compliance</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SA Marketplace. Built for South African entrepreneurs.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

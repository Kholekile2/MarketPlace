import Link from 'next/link'
import { ShoppingBagIcon, ShareIcon, ClipboardListIcon } from 'lucide-react'

export const metadata = {
  title: 'SA Marketplace – Sell Online, Manage Orders',
  description:
    'Create your online storefront, share it on social media, and manage customer orders professionally.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">SA Marketplace</span>
          <div className="flex items-center space-x-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Sell online.<br />Manage orders professionally.
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Turn your social media hustle into a proper online store. Add your products, share your
            link, and track every order — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Create Your Free Store
            </Link>
            <Link
              href="/business/demo"
              className="w-full sm:w-auto px-8 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              See a Demo Store
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Create your store</h3>
              <p className="text-gray-600">
                Sign up, set up your business profile, and add your products with photos and prices.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShareIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Share your link</h3>
              <p className="text-gray-600">
                Post your store link on Instagram, TikTok, and WhatsApp. Keep using the audience you
                already have.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardListIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Manage your orders</h3>
              <p className="text-gray-600">
                Track every order from pending to delivered. Print receipts and stay organised
                without spreadsheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="bg-gray-50 border-t border-gray-200 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Platform Disclaimer:</strong> SA Marketplace provides digital storefront and
            order management tools only. It does not process payments, provide financial services,
            act as a courier, or generate legally binding contracts or tax invoices. All transactions
            and arrangements are made directly between buyers and sellers.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
          <span>© 2025 SA Marketplace</span>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Link href="/register" className="hover:text-gray-700">
              Get Started
            </Link>
            <Link href="/login" className="hover:text-gray-700">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

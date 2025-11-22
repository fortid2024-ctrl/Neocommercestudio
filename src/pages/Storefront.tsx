import { Header } from '../components/Header';
import { ProductGrid } from '../components/ProductGrid';

interface StorefrontProps {
  onProductClick: (id: string) => void;
  onNavigate: (page: string) => void;
}

export function Storefront({ onProductClick, onNavigate }: StorefrontProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNavigate={onNavigate} />

      <main>
        <div className="relative bg-gradient-to-b from-red-900/20 to-black py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Premium Digital <span className="text-red-600">Ebooks</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Discover our curated collection of digital books. Instant access,
                secure crypto payments, lifetime downloads.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-gray-400">Explore our collection</p>
          </div>

          <ProductGrid onProductClick={onProductClick} />
        </div>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                <span className="text-red-600">Neo</span>Commerce
                <span className="text-white">Studio</span>
              </h3>
              <p className="text-gray-400">
                Your trusted source for premium digital ebooks.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/" className="hover:text-white transition-colors">
                    Store
                  </a>
                </li>
                <li>
                  <a href="#categories" className="hover:text-white transition-colors">
                    Categories
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Payment</h4>
              <p className="text-gray-400">
                Secure cryptocurrency payments powered by Cryptomus
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 NeoCommerceStudio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

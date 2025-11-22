import { User, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  onNavigate?: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const { user } = useAuth();
  const { getItemCount } = useCart();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, page: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(page);
    }
  };

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a
              href="/"
              onClick={(e) => handleNavClick(e, 'home')}
              className="text-2xl font-bold text-red-600 hover:text-red-500 transition-colors"
            >
              NeoCommerce<span className="text-white">Studio</span>
            </a>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a
              href="/"
              onClick={(e) => handleNavClick(e, 'home')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="/store"
              onClick={(e) => handleNavClick(e, 'store')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Store
            </a>
            <a
              href="/categories"
              onClick={(e) => handleNavClick(e, 'categories')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Categories
            </a>
            <a
              href="/contact"
              onClick={(e) => handleNavClick(e, 'contact')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </a>
            {user && (
              <a
                href="/admin"
                onClick={(e) => handleNavClick(e, 'admin')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Admin
              </a>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate?.('cart')}
              className="relative text-gray-300 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>

            {user ? (
              <a
                href="/admin"
                onClick={(e) => handleNavClick(e, 'admin')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Admin</span>
              </a>
            ) : (
              <a
                href="/login"
                onClick={(e) => handleNavClick(e, 'login')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

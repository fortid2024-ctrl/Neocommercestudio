import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Home } from './pages/Home';
import { Storefront } from './pages/Storefront';
import { Categories } from './pages/Categories';
import { Contact } from './pages/Contact';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { CheckoutCart } from './pages/CheckoutCart';
import { Cart } from './pages/Cart';
import { Download } from './pages/Download';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { Product } from './lib/firebase';
import { initializeAdminUser } from './utils/initAdmin';

type Page = 'home' | 'store' | 'categories' | 'contact' | 'product' | 'checkout' | 'cart' | 'download' | 'login' | 'admin';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    initializeAdminUser();
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/store') {
      setCurrentPage('store');
    } else if (path === '/categories') {
      setCurrentPage('categories');
    } else if (path === '/contact') {
      setCurrentPage('contact');
    } else if (path === '/download') {
      const token = params.get('token');
      if (token) {
        setDownloadToken(token);
        setCurrentPage('download');
      }
    } else {
      setCurrentPage('home');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePopState = () => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/store') {
      setCurrentPage('store');
    } else if (path === '/categories') {
      setCurrentPage('categories');
    } else if (path === '/contact') {
      setCurrentPage('contact');
    } else {
      setCurrentPage('home');
      setSelectedProduct(null);
      setSelectedProductId(null);
    }
  };

  const navigateTo = (page: Page | string) => {
    const targetPage = page as Page;
    setCurrentPage(targetPage);

    const routes: Record<string, string> = {
      home: '/',
      store: '/store',
      categories: '/categories',
      contact: '/contact',
      cart: '/cart',
      checkout: '/checkout',
      login: '/login',
      admin: '/admin',
    };

    if (routes[targetPage]) {
      window.history.pushState({}, '', routes[targetPage]);
    }

    if (targetPage === 'home' || targetPage === 'store') {
      setSelectedProduct(null);
      setSelectedProductId(null);
    }
  };

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product');
  };

  const handleCheckout = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('checkout');
  };

  const handleLoginSuccess = () => {
    navigateTo('admin');
  };

  const handleLogout = () => {
    navigateTo('home');
  };

  useEffect(() => {
    if (!loading && currentPage === 'admin' && !user) {
      navigateTo('login');
    }
  }, [user, loading, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (currentPage === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentPage === 'admin') {
    if (!user) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }
    return <Admin onLogout={handleLogout} />;
  }

  if (currentPage === 'download' && downloadToken) {
    return <Download token={downloadToken} />;
  }

  if (currentPage === 'checkout') {
    if (selectedProduct) {
      return (
        <Checkout
          product={selectedProduct}
          onBack={() => setCurrentPage('product')}
          onPaymentCreated={(orderId) => {
            console.log('Payment created:', orderId);
          }}
        />
      );
    }
    return <CheckoutCart onNavigate={navigateTo} />;
  }

  if (currentPage === 'product' && selectedProductId) {
    return (
      <ProductDetail
        productId={selectedProductId}
        onBack={() => navigateTo('store')}
        onNavigate={navigateTo}
        onCheckout={handleCheckout}
      />
    );
  }

  if (currentPage === 'home') {
    return <Home onNavigate={navigateTo} onProductClick={handleProductClick} />;
  }

  if (currentPage === 'store') {
    return <Storefront onProductClick={handleProductClick} onNavigate={navigateTo} />;
  }

  if (currentPage === 'categories') {
    return <Categories onNavigate={navigateTo} onProductClick={handleProductClick} />;
  }

  if (currentPage === 'contact') {
    return <Contact onNavigate={navigateTo} />;
  }

  if (currentPage === 'cart') {
    return <Cart onNavigate={navigateTo} />;
  }

  return <Home onNavigate={navigateTo} />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { firestoreService } from '../lib/firestoreService';
import { Product } from '../lib/firebase';
import { useCart } from '../contexts/CartContext';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onNavigate: (page: string) => void;
  onCheckout: (product: Product) => void;
}

export function ProductDetail({ productId, onBack, onNavigate, onCheckout }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await firestoreService.getProduct(productId);
      setProduct(data);
    } catch (err) {
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header onNavigate={onNavigate} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header onNavigate={onNavigate} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <button
              onClick={onBack}
              className="text-red-600 hover:text-red-500 transition-colors"
            >
              Return to store
            </button>
          </div>
        </div>
      </div>
    );
  }

  const discountPercent = Math.round(
    ((product.original_price - product.discounted_price) / product.original_price) * 100
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNavigate={onNavigate} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative">
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-900">
              <img
                src={product.cover_image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {discountPercent > 0 && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-lg font-bold">
                -{discountPercent}%
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>

            <div className="flex items-baseline space-x-4 mb-6">
              <span className="text-4xl font-bold text-red-600">
                ${product.discounted_price.toFixed(2)}
              </span>
              {product.original_price > product.discounted_price && (
                <span className="text-2xl text-gray-500 line-through">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="prose prose-invert mb-8 flex-grow">
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  addToCart(product);
                  alert('Produit ajouté au panier!');
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter au Panier</span>
              </button>

              <button
                onClick={() => onCheckout(product)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Acheter Maintenant</span>
              </button>

              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="font-semibold mb-3">What you'll get:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center space-x-2">
                    <span className="text-red-600">✓</span>
                    <span>Instant digital download</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-600">✓</span>
                    <span>PDF format</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-600">✓</span>
                    <span>Secure crypto payment</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-600">✓</span>
                    <span>Lifetime access</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

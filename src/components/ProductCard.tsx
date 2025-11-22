import { Product } from '../lib/firebase';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onClick: (id: string) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { addToCart } = useCart();
  const discountPercent = Math.round(
    ((product.original_price - product.discounted_price) / product.original_price) * 100
  );

  return (
    <div
      onClick={() => onClick(product.id!)}
      className="group cursor-pointer bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-600 transition-all duration-300 transform hover:scale-105"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-gray-800">
        <img
          src={product.cover_image_url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
        />
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{discountPercent}%
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
          {product.title}
        </h3>

        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-red-600">
              ${product.discounted_price.toFixed(2)}
            </span>
            {product.original_price > product.discounted_price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
            title="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

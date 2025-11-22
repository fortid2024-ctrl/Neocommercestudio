import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { firestoreService } from '../lib/firestoreService';
import { Product, Category } from '../lib/firebase';
import { Loader2, Tag } from 'lucide-react';

interface CategoriesProps {
  onNavigate: (page: string) => void;
  onProductClick: (id: string) => void;
}

export function Categories({ onNavigate, onProductClick }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await firestoreService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const data = await firestoreService.getProductsByCategory(categoryId);
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Nos <span className="text-red-600">Catégories</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explorez notre collection organisée par catégories
          </p>
        </div>

        {loading && categories.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">
              Aucune catégorie disponible pour le moment.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                  className={`p-6 rounded-lg border-2 transition-all transform hover:scale-105 ${
                    selectedCategory === category.id
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-red-600'
                  }`}
                >
                  <Tag className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                </button>
              ))}
            </div>

            {selectedCategory && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">Produits</h2>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Effacer le filtre
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-20 bg-gray-900 rounded-lg">
                    <p className="text-gray-400">
                      Aucun produit dans cette catégorie.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                      const discountPercent = Math.round(
                        ((product.original_price - product.discounted_price) /
                          product.original_price) *
                          100
                      );

                      return (
                        <div
                          key={product.id}
                          onClick={() => onProductClick(product.id)}
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
                                {product.original_price >
                                  product.discounted_price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ${product.original_price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!selectedCategory && (
              <div className="text-center py-20 bg-gray-900 rounded-lg">
                <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-400">
                  Sélectionnez une catégorie pour voir les produits
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../lib/firestoreService';
import { Product } from '../lib/firebase';
import { Plus, Edit2, Trash2, LogOut, Package, Tags, ShoppingBag, Settings } from 'lucide-react';
import { ProductForm } from '../components/admin/ProductForm';
import { CategoryManager } from '../components/admin/CategoryManager';
import { OrderList } from '../components/admin/OrderList';
import { SettingsManager } from '../components/admin/SettingsManager';

interface AdminProps {
  onLogout: () => void;
}

export function Admin({ onLogout }: AdminProps) {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    }
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getProducts(false);
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await firestoreService.deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">
              <span className="text-red-600">Admin</span> Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Products</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Tags className="w-5 h-5" />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>

        {activeTab === 'products' && (
          <>
            {showProductForm ? (
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <ProductForm
                  product={editingProduct}
                  onSave={handleProductSaved}
                  onCancel={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Products</h2>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">Loading...</div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    No products yet. Add your first product to get started.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-gray-900 rounded-lg p-6 flex gap-6"
                      >
                        <img
                          src={product.cover_image_url}
                          alt={product.title}
                          className="w-24 h-36 object-cover rounded"
                        />
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">
                                {product.title}
                              </h3>
                              <p className="text-gray-400 text-sm line-clamp-2">
                                {product.description}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductForm(true);
                                }}
                                className="p-2 text-blue-500 hover:text-blue-400 transition-colors"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 text-red-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-4">
                            <span className="text-red-600 font-bold">
                              ${product.discounted_price.toFixed(2)}
                            </span>
                            {product.original_price > product.discounted_price && (
                              <span className="text-gray-500 line-through">
                                ${product.original_price.toFixed(2)}
                              </span>
                            )}
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                product.is_active
                                  ? 'bg-green-900 text-green-300'
                                  : 'bg-gray-800 text-gray-400'
                              }`}
                            >
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'orders' && <OrderList />}
        {activeTab === 'settings' && <SettingsManager />}
      </div>
    </div>
  );
}

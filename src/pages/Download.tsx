import { useState, useEffect } from 'react';
import { Download as DownloadIcon, CheckCircle, Loader2 } from 'lucide-react';
import { firestoreService } from '../lib/firestoreService';

interface DownloadProps {
  token: string;
}

export function Download({ token }: DownloadProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [token]);

  const loadOrder = async () => {
    try {
      console.log('🔍 Loading order with token:', token);
      const orderData = await firestoreService.getOrderByToken(token);

      if (!orderData) {
        console.error('❌ Order not found');
        setError('Invalid or expired download link');
        setLoading(false);
        return;
      }

      console.log('✅ Order found:', orderData);

      let items = [];
      try {
        items = JSON.parse(orderData.items || '[]');
        console.log('📋 Parsed items:', items);
      } catch (e) {
        console.error('Error parsing items:', e);
        setError('Failed to parse order items');
        setLoading(false);
        return;
      }

      if (!items || items.length === 0) {
        console.error('❌ No items in order');
        setError('No products found in this order');
        setLoading(false);
        return;
      }

      const productPromises = items.map(async (item: any) => {
        try {
          const product = await firestoreService.getProduct(item.productId);
          if (product) {
            return { ...product, quantity: item.quantity || 1 };
          }
          console.error('Product not found:', item.productId);
          return null;
        } catch (err) {
          console.error('Error loading product:', item.productId, err);
          return null;
        }
      });

      const productsData = await Promise.all(productPromises);
      const validProducts = productsData.filter(p => p !== null);

      console.log('📦 Products loaded:', validProducts);

      if (validProducts.length === 0) {
        console.error('❌ No valid products found');
        setError('Products not available');
        setLoading(false);
        return;
      }

      setOrder(orderData);
      setProducts(validProducts);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading order:', err);
      setError('Failed to load download');
      setLoading(false);
    }
  };

  const handleDownload = (product: any) => {
    if (!product || !product.pdf_file_url) {
      setError('PDF file not available');
      return;
    }

    console.log('🔗 Opening Google Drive link:', product.pdf_file_url);
    window.open(product.pdf_file_url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">{error}</h2>
          <a href="/" className="text-gray-400 hover:text-white transition-colors">
            Return to store
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-400 text-lg">
            Thank you for your purchase. Your ebooks are ready to download.
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Order Details</h2>
          <div className="text-sm text-gray-400 space-y-1">
            <p>Order Number: <span className="text-white">{order.order_number}</span></p>
            <p>Email: <span className="text-white">{order.customer_email}</span></p>
            {order.customer_name && (
              <p>Name: <span className="text-white">{order.customer_name}</span></p>
            )}
            <p>Total: <span className="text-white">${order.amount_paid.toFixed(2)}</span></p>
            <p>Date: <span className="text-white">{new Date(order.created_at).toLocaleDateString()}</span></p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Your Products</h2>
          {products.map((product) => (
            <div key={product.id} className="bg-gray-900 rounded-lg p-6">
              <div className="flex gap-6 mb-6">
                <img
                  src={product.cover_image_url}
                  alt={product.title}
                  className="w-24 h-36 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                  {product.quantity > 1 && (
                    <p className="text-gray-500 text-sm">Quantity: {product.quantity}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDownload(product)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <DownloadIcon className="w-5 h-5" />
                <span>Access PDF on Google Drive</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>💡 Tip: Save this page URL to access your downloads anytime</p>
          <p className="mt-2">Need help? Contact us at support@neocommercestudio.com</p>
        </div>
      </div>
    </div>
  );
}

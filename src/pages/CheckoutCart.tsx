import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { Loader2, CreditCard } from 'lucide-react';
import { firestoreService } from '../lib/firestoreService';

interface CheckoutCartProps {
  onNavigate: (page: string) => void;
}

export function CheckoutCart({ onNavigate }: CheckoutCartProps) {
  const { items, getTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [cryptomusEnabled, setCryptomusEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'cryptomus' | 'paypal'>('cryptomus');
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await firestoreService.getSettings();
      if (settings) {
        setPaymentEnabled(settings.paymentEnabled || false);
        setCryptomusEnabled(settings.cryptomusEnabled ?? true);
        setPaypalEnabled(settings.paypalEnabled || false);

        if (settings.cryptomusEnabled) {
          setSelectedMethod('cryptomus');
        } else if (settings.paypalEnabled) {
          setSelectedMethod('paypal');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!paymentEnabled) {
        // TEST MODE: Bypass crypto payment and create order directly
        const orderNumber = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const downloadToken = crypto.randomUUID();

        console.log('🧪 TEST MODE: Creating cart order directly...');

        const itemsData = items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          title: item.product.title,
          price: item.product.discounted_price,
        }));

        // Create order in Firestore
        const orderId = await firestoreService.addOrder({
          order_number: orderNumber,
          customer_name: formData.name,
          customer_email: formData.email,
          amount_paid: getTotal(),
          currency: 'USD',
          payment_status: 'completed',
          cryptomus_payment_id: 'TEST_MODE',
          download_token: downloadToken,
          items: JSON.stringify(itemsData),
        });

        console.log('✅ Cart order created:', orderId);

        // Clear cart
        clearCart();

        // Redirect to download page
        const downloadUrl = `/download?token=${downloadToken}`;
        console.log('🔗 Redirecting to:', downloadUrl);
        window.location.href = downloadUrl;
      } else {
        // PAYMENT MODE
        const functionName = selectedMethod === 'cryptomus' ? 'create-payment' : 'create-paypal-payment';

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              items: items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                title: item.product.title,
                price: item.product.discounted_price,
              })),
              customerName: formData.name,
              customerEmail: formData.email,
              totalAmount: getTotal(),
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment');
        }

        const data = await response.json();

        if (data.paymentUrl) {
          clearCart();
          window.location.href = data.paymentUrl;
        } else {
          throw new Error('No payment URL received');
        }
      }
    } catch (err) {
      console.error('❌ Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process checkout');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    onNavigate('store');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNavigate={onNavigate} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold">Checkout</h1>
            {!paymentEnabled && (
              <span className="bg-yellow-600 text-black text-xs font-bold px-3 py-1 rounded-full uppercase">Test Mode</span>
            )}
          </div>
          {!paymentEnabled && (
            <p className="text-gray-400 text-sm">Crypto payment is disabled for testing. Orders will be created immediately.</p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Customer Information</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
                    placeholder="your@email.com"
                  />
                  <p className="mt-2 text-sm text-gray-400">
                    Download links will be sent to this email after payment
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 text-red-200">
                    {error}
                  </div>
                )}

                {paymentEnabled && (cryptomusEnabled || paypalEnabled) && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Payment Method</label>
                    <div className="space-y-3">
                      {cryptomusEnabled && (
                        <button
                          type="button"
                          onClick={() => setSelectedMethod('cryptomus')}
                          className={`w-full p-4 rounded-lg border-2 transition-all ${
                            selectedMethod === 'cryptomus'
                              ? 'border-red-600 bg-red-600/10'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <div className="font-semibold mb-1">Cryptocurrency</div>
                              <div className="text-sm text-gray-400">Bitcoin, Ethereum, USDT, and more</div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedMethod === 'cryptomus' ? 'border-red-600' : 'border-gray-600'
                            }`}>
                              {selectedMethod === 'cryptomus' && (
                                <div className="w-3 h-3 rounded-full bg-red-600" />
                              )}
                            </div>
                          </div>
                        </button>
                      )}

                      {paypalEnabled && (
                        <button
                          type="button"
                          onClick={() => setSelectedMethod('paypal')}
                          className={`w-full p-4 rounded-lg border-2 transition-all ${
                            selectedMethod === 'paypal'
                              ? 'border-red-600 bg-red-600/10'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <div className="font-semibold mb-1">PayPal</div>
                              <div className="text-sm text-gray-400">Credit/debit cards and PayPal balance</div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedMethod === 'paypal' ? 'border-red-600' : 'border-gray-600'
                            }`}>
                              {selectedMethod === 'paypal' && (
                                <div className="w-3 h-3 rounded-full bg-red-600" />
                              )}
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>
                        {!paymentEnabled
                          ? 'Test Download (Free)'
                          : selectedMethod === 'cryptomus'
                          ? 'Pay with Cryptocurrency'
                          : 'Pay with PayPal'
                        }
                      </span>
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-gray-400 space-y-1">
                  {paymentEnabled ? (
                    <>
                      <p>Secure payment powered by {selectedMethod === 'cryptomus' ? 'Cryptomus' : 'PayPal'}</p>
                      {selectedMethod === 'cryptomus' && (
                        <p>Accepts Bitcoin, Ethereum, USDT, and more</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-yellow-500 font-semibold">⚠️ Test Mode Active</p>
                      <p>No payment required. You'll be redirected to download immediately.</p>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <img
                      src={item.product.cover_image_url}
                      alt={item.product.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">
                        {item.product.title}
                      </h3>
                      <p className="text-gray-400 text-xs mb-2">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-red-600 font-bold">
                        ${(item.product.discounted_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-red-600">${getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

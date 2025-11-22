import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import { firestoreService } from '../../lib/firestoreService';

export function SettingsManager() {
  const [settings, setSettings] = useState({
    paymentEnabled: false,
    cryptomusEnabled: true,
    paypalEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await firestoreService.getSettings();
      if (data) {
        setSettings({
          paymentEnabled: data.paymentEnabled || false,
          cryptomusEnabled: data.cryptomusEnabled !== undefined ? data.cryptomusEnabled : true,
          paypalEnabled: data.paypalEnabled || false,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      console.log('💾 Saving settings:', settings);
      await firestoreService.updateSettings(settings);
      console.log('✅ Settings saved successfully');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <p className="text-gray-400 mb-8">
          Configure global application settings
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Payment Configuration</h3>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-lg">Payment Mode</h4>
                {settings.paymentEnabled ? (
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ENABLED
                  </span>
                ) : (
                  <span className="bg-yellow-600 text-black text-xs font-bold px-3 py-1 rounded-full">
                    TEST MODE
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                {settings.paymentEnabled
                  ? 'Customers will be redirected to payment gateways'
                  : 'Orders will be created immediately without payment (for testing)'}
              </p>
            </div>

            <div className="ml-6">
              <button
                onClick={() => setSettings({ ...settings, paymentEnabled: !settings.paymentEnabled })}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  settings.paymentEnabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.paymentEnabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {!settings.paymentEnabled && (
            <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <p className="text-yellow-500 text-sm">
                <strong>⚠️ Warning:</strong> Test mode is active. Customers won't be charged and will get immediate access to products.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-semibold text-md text-gray-300">Payment Gateways</h4>

            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h5 className="font-semibold">Cryptomus (Crypto)</h5>
                  {settings.cryptomusEnabled && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">
                  Accept Bitcoin, Ethereum, USDT, and other cryptocurrencies
                </p>
              </div>
              <div className="ml-6">
                <button
                  onClick={() => setSettings({ ...settings, cryptomusEnabled: !settings.cryptomusEnabled })}
                  disabled={!settings.paymentEnabled}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    settings.cryptomusEnabled && settings.paymentEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      settings.cryptomusEnabled ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h5 className="font-semibold">PayPal</h5>
                  {settings.paypalEnabled && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">
                  Accept credit cards, debit cards, and PayPal balance
                </p>
              </div>
              <div className="ml-6">
                <button
                  onClick={() => setSettings({ ...settings, paypalEnabled: !settings.paypalEnabled })}
                  disabled={!settings.paymentEnabled}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    settings.paypalEnabled && settings.paymentEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      settings.paypalEnabled ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-600 rounded-lg">
              <p className="text-red-500 text-sm">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

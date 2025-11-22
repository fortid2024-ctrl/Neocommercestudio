import { useState, useEffect } from 'react';
import { firestoreService } from '../../lib/firestoreService';
import { Product, Category } from '../../lib/firebase';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
  product: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    original_price: product?.original_price || 0,
    discounted_price: product?.discounted_price || 0,
    category_id: product?.category_id || '',
    cover_image_url: product?.cover_image_url || '',
    pdf_file_url: product?.pdf_file_url || '',
    is_active: product?.is_active ?? true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await firestoreService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.pdf_file_url) {
      alert('Please upload a PDF file');
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        category_id: formData.category_id || null,
      };

      if (product?.id) {
        await firestoreService.updateProduct(product.id, dataToSave);
      } else {
        await firestoreService.addProduct(dataToSave);
      }

      onSave();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={4}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Original Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.original_price}
            onChange={(e) =>
              setFormData({
                ...formData,
                original_price: parseFloat(e.target.value),
              })
            }
            required
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Discounted Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.discounted_price}
            onChange={(e) =>
              setFormData({
                ...formData,
                discounted_price: parseFloat(e.target.value),
              })
            }
            required
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={formData.category_id}
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value })
          }
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
        >
          <option value="">No Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Cover Image URL
        </label>
        <input
          type="url"
          value={formData.cover_image_url}
          onChange={(e) =>
            setFormData({ ...formData, cover_image_url: e.target.value })
          }
          required
          placeholder="https://example.com/cover.jpg"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Google Drive PDF Link *
        </label>
        <input
          type="url"
          value={formData.pdf_file_url}
          onChange={(e) =>
            setFormData({ ...formData, pdf_file_url: e.target.value })
          }
          required
          placeholder="https://drive.google.com/file/d/..."
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-white"
        />
        <p className="mt-2 text-sm text-gray-400">
          Share your PDF on Google Drive and paste the link here
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) =>
            setFormData({ ...formData, is_active: e.target.checked })
          }
          className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-600"
        />
        <label htmlFor="is_active" className="ml-2 text-sm">
          Active (visible in store)
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Product'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

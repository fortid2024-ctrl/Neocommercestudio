import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { firestoreService } from '../lib/firestoreService';
import { Product } from '../lib/firebase';
import { BookOpen, Shield, Download, Zap, ArrowRight, Star, Loader2 } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
  onProductClick?: (productId: string) => void;
}

const REVIEWS = [
  {
    id: 1,
    name: 'Marie Dubois',
    rating: 5,
    comment: 'Excellente plateforme! Les ebooks sont de très haute qualité et le paiement en crypto est super pratique.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
  },
  {
    id: 2,
    name: 'Jean Martin',
    rating: 5,
    comment: 'J\'adore! Accès instantané après le paiement et une grande variété de contenus. Très satisfait de mon achat.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
  },
  {
    id: 3,
    name: 'Sophie Bernard',
    rating: 5,
    comment: 'Service impeccable, téléchargements rapides et sécurisés. Je recommande vivement!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  },
  {
    id: 4,
    name: 'Pierre Leroy',
    rating: 5,
    comment: 'Interface moderne et intuitive. Les paiements crypto rendent tout tellement plus simple et rapide!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre',
  },
];

export function Home({ onNavigate, onProductClick }: HomeProps) {
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestProducts();
  }, []);

  const loadLatestProducts = async () => {
    try {
      const products = await firestoreService.getProducts(true);
      setLatestProducts(products.slice(0, 8));
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    if (onProductClick) {
      onProductClick(productId);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onNavigate={onNavigate} />

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/30 via-black to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
              Bienvenue chez
              <br />
              <span className="text-red-600">NeoCommerce</span>
              <span className="text-white">Studio</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Votre destination pour des ebooks numériques premium. Accès
              instantané, paiements crypto sécurisés, téléchargements à vie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('store')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Explorer la boutique</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('categories')}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
              >
                Voir les catégories
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Derniers <span className="text-red-600">Ebooks</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Découvrez nos derniers ajouts et commencez votre lecture dès maintenant
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            </div>
          ) : latestProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {latestProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                  />
                ))}
              </div>
              <div className="text-center">
                <button
                  onClick={() => onNavigate('store')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all inline-flex items-center space-x-2"
                >
                  <span>Voir tous les produits</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Aucun produit disponible pour le moment</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Pourquoi <span className="text-red-600">Nous Choisir</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Découvrez les avantages qui font de nous le meilleur choix pour vos
              ebooks numériques
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-750 transition-all transform hover:scale-105">
              <div className="bg-red-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Accès Instantané</h3>
              <p className="text-gray-400">
                Téléchargez vos ebooks immédiatement après l'achat. Pas d'attente,
                commencez à lire tout de suite.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-750 transition-all transform hover:scale-105">
              <div className="bg-red-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Paiements Sécurisés</h3>
              <p className="text-gray-400">
                Transactions crypto 100% sécurisées via Cryptomus. Vos données sont
                protégées.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-750 transition-all transform hover:scale-105">
              <div className="bg-red-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Téléchargements Illimités</h3>
              <p className="text-gray-400">
                Accès à vie à vos achats. Téléchargez sur tous vos appareils quand
                vous voulez.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-750 transition-all transform hover:scale-105">
              <div className="bg-red-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Contenu Premium</h3>
              <p className="text-gray-400">
                Collection soigneusement sélectionnée d'ebooks de haute qualité dans
                tous les genres.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Avis de nos <span className="text-red-600">Clients</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Découvrez ce que nos clients disent de leur expérience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-semibold">{review.name}</h4>
                    <div className="flex space-x-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-900/50 to-black border border-red-800 rounded-2xl p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à Commencer?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de lecteurs satisfaits et découvrez notre
              collection d'ebooks premium dès aujourd'hui.
            </p>
            <button
              onClick={() => onNavigate('store')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-12 rounded-lg transition-all transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Explorer Maintenant</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">500+</div>
              <p className="text-xl text-gray-400">Ebooks Disponibles</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">10K+</div>
              <p className="text-xl text-gray-400">Clients Satisfaits</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">24/7</div>
              <p className="text-xl text-gray-400">Support Client</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 NeoCommerceStudio. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

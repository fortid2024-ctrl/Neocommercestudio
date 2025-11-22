# Configuration Cryptomus - Paiements Crypto

## ✅ Système de Panier et Paiement Installé

Votre application dispose maintenant d'un système complet de panier et paiement avec Cryptomus!

## 🛒 Fonctionnalités Ajoutées

### 1. **Panier d'Achat**
- ✅ Bouton "Ajouter au panier" sur chaque produit
- ✅ Icône panier dans l'en-tête avec badge de quantité
- ✅ Page panier complète avec gestion des quantités
- ✅ Sauvegarde locale du panier (persiste après rechargement)

### 2. **Processus de Checkout**
- ✅ Formulaire client (Nom + Email)
- ✅ Récapitulatif de commande
- ✅ Intégration Cryptomus pour paiements crypto
- ✅ Redirection vers page de paiement Cryptomus

## 🔧 Configuration Cryptomus

### Étape 1: Créer un compte Cryptomus

1. Allez sur: https://cryptomus.com
2. Cliquez sur **Sign Up** (Inscription)
3. Créez votre compte marchand

### Étape 2: Obtenir vos identifiants API

1. Connectez-vous à votre compte Cryptomus
2. Allez dans **Settings** → **API Keys**
3. Vous verrez:
   - **Merchant ID** (UUID)
   - **Payment API Key**

### Étape 3: Configurer les variables d'environnement

Dans votre fichier `.env`, remplacez:

```env
CRYPTOMUS_API_KEY=your_cryptomus_api_key_here
CRYPTOMUS_MERCHANT_ID=your_cryptomus_merchant_id_here
```

Par vos vraies clés:

```env
CRYPTOMUS_API_KEY=votre_clé_api_cryptomus
CRYPTOMUS_MERCHANT_ID=votre_merchant_id_cryptomus
```

### Étape 4: Déployer la fonction de paiement

La fonction edge `create-payment` est déjà créée. Pour la déployer:

1. Assurez-vous que vos clés Cryptomus sont dans `.env`
2. La fonction est dans: `supabase/functions/create-payment/`
3. Elle sera automatiquement déployée avec votre projet

## 💳 Comment ça fonctionne

### Flux de Paiement

1. **Client ajoute des produits au panier**
   - Clique sur l'icône panier sur chaque produit
   - Badge montre le nombre d'articles

2. **Client va au panier**
   - Clique sur l'icône panier dans l'en-tête
   - Voit tous ses articles
   - Peut modifier les quantités
   - Voit le total

3. **Client procède au checkout**
   - Clique sur "Proceed to Checkout"
   - Remplit son nom et email
   - Clique sur "Pay with Cryptocurrency"

4. **Création du paiement Cryptomus**
   - Appel à la fonction edge `create-payment`
   - Génération d'une signature MD5 sécurisée
   - Création d'une facture sur Cryptomus
   - Retour de l'URL de paiement

5. **Redirection vers Cryptomus**
   - Client est redirigé vers la page de paiement Cryptomus
   - Peut payer en Bitcoin, Ethereum, USDT, etc.
   - Après paiement, retour vers votre site

## 🔒 Sécurité

### Signature MD5
Chaque requête vers Cryptomus est signée avec:
```javascript
MD5(JSON.stringify(data) + API_KEY)
```

### Données envoyées à Cryptomus
```json
{
  "amount": "99.99",
  "currency": "USD",
  "order_id": "ORD-1234567890-ABC123",
  "url_return": "https://yoursite.com/download?token=...",
  "url_callback": "https://yoursite.com/functions/v1/payment-webhook",
  "additional_data": {
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "items": [...],
    "downloadToken": "..."
  }
}
```

## 🌐 Cryptomonnaies Acceptées

Cryptomus supporte:
- Bitcoin (BTC)
- Ethereum (ETH)
- USDT (Tether)
- USDC
- Litecoin (LTC)
- Bitcoin Cash (BCH)
- Et plus de 20 autres cryptos!

## 📝 Test sans Cryptomus

Si vous n'avez pas encore configuré Cryptomus, la fonction retournera une erreur claire:

```json
{
  "error": "Payment gateway not configured. Please add CRYPTOMUS_API_KEY and CRYPTOMUS_MERCHANT_ID to your environment variables."
}
```

## 🎯 Pages Créées

### 1. `/cart` - Page Panier
- Liste des produits dans le panier
- Boutons +/- pour quantités
- Bouton supprimer
- Total du panier
- Bouton "Proceed to Checkout"

### 2. `/checkout` - Page Paiement
- Formulaire client (Nom + Email)
- Récapitulatif de commande
- Bouton "Pay with Cryptocurrency"
- Messages d'erreur clairs

### 3. Composants Modifiés
- **Header**: Ajout icône panier avec badge
- **ProductCard**: Ajout bouton "Add to Cart"

## 📊 Structure des Données

### CartContext
```typescript
{
  items: CartItem[],
  addToCart: (product) => void,
  removeFromCart: (productId) => void,
  updateQuantity: (productId, quantity) => void,
  clearCart: () => void,
  getTotal: () => number,
  getItemCount: () => number
}
```

### CartItem
```typescript
{
  product: Product,
  quantity: number
}
```

## 🚀 Démarrage

1. **Configurez Cryptomus** (suivez les étapes ci-dessus)
2. **Lancez l'application**: `npm run dev`
3. **Testez le flux**:
   - Allez sur `/store`
   - Ajoutez des produits au panier
   - Allez au panier
   - Procédez au checkout
   - Payez avec crypto!

## ⚠️ Important

### Variables d'environnement requises
```env
# Firebase (déjà configuré)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...

# Supabase (déjà configuré)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Cryptomus (À CONFIGURER)
CRYPTOMUS_API_KEY=votre_clé_api
CRYPTOMUS_MERCHANT_ID=votre_merchant_id
```

### Webhook (Optionnel)
Pour recevoir les notifications de paiement, configurez dans Cryptomus:
```
Webhook URL: https://votre-site.supabase.co/functions/v1/payment-webhook
```

## 📖 Documentation Cryptomus

- API Documentation: https://doc.cryptomus.com
- Creating Invoice: https://doc.cryptomus.com/business/payments/creating-invoice
- Dashboard: https://cryptomus.com/dashboard

## ✨ Statut

✅ Panier fonctionnel
✅ Checkout avec formulaire client
✅ Intégration Cryptomus prête
✅ Edge function créée
✅ Signature sécurisée MD5
✅ Gestion des erreurs
✅ Build réussi

**Il ne reste plus qu'à ajouter vos clés API Cryptomus dans le fichier `.env` et vous pourrez accepter les paiements en crypto!**

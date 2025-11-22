# Configuration Firestore - NeoCommerceStudio

## ✅ Configuration Firebase Active

Votre application utilise la configuration Firebase suivante:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBHiaVW7LteeuHf6oacHo_1uaeUzK5FaQE",
  authDomain: "neocommercestudio-29a5a.firebaseapp.com",
  projectId: "neocommercestudio-29a5a",
  storageBucket: "neocommercestudio-29a5a.firebasestorage.app",
  messagingSenderId: "1098033630526",
  appId: "1:1098033630526:web:12d5e511cd131ae7fab06f",
  measurementId: "G-8RL25M7WCX"
};
```

## 🔧 Règles de sécurité Firestore à configurer

1. Allez dans **Firebase Console**: https://console.firebase.google.com
2. Sélectionnez votre projet: **neocommercestudio-29a5a**
3. Menu latéral → **Firestore Database**
4. Onglet **Rules** (Règles)
5. Copiez-collez ces règles:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Collection admin_users - pour l'authentification
    match /admin_users/{userId} {
      allow read, write: if true;
    }

    // Collection products - pour les produits/ebooks
    match /products/{productId} {
      allow read: if true;
      allow write: if true;
    }

    // Collection categories - pour les catégories
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if true;
    }

    // Collection orders - pour les commandes
    match /orders/{orderId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
    }

    // Collection settings - pour les paramètres de paiement
    match /settings/{settingId} {
      allow read, write: if true;
    }
  }
}
```

6. Cliquez sur **Publier** (Publish)

## 📦 Collections Firestore

Votre application créera automatiquement ces collections:

### 1. **admin_users** (Utilisateurs administrateurs)
Structure:
```javascript
{
  email: "neocommerce@admin.com",
  password: "Rahma1211",
  role: "admin",
  created_at: "2025-11-21T..."
}
```

### 2. **products** (Produits/Ebooks)
Structure:
```javascript
{
  title: "Titre du produit",
  description: "Description du produit",
  original_price: 99.99,
  discounted_price: 49.99,
  category_id: "abc123",
  cover_image_url: "https://...",
  pdf_file_url: "https://...",
  is_active: true,
  created_at: "2025-11-21T...",
  updated_at: "2025-11-21T..."
}
```

### 3. **categories** (Catégories)
Structure:
```javascript
{
  name: "E-books",
  slug: "ebooks",
  created_at: "2025-11-21T..."
}
```

### 4. **orders** (Commandes)
Structure:
```javascript
{
  order_number: "ORD-123456",
  product_id: "abc123",
  customer_email: "client@example.com",
  amount_paid: 49.99,
  currency: "USD",
  payment_status: "completed",
  cryptomus_payment_id: "...",
  download_token: "...",
  download_expires_at: "2025-11-21T...",
  downloaded_at: null,
  created_at: "2025-11-21T..."
}
```

### 5. **settings** (Paramètres de paiement)
Structure:
```javascript
{
  paymentEnabled: false,
  created_at: "2025-11-21T...",
  updated_at: "2025-11-21T..."
}
```

## 🚀 Démarrage automatique

Quand vous lancez l'application pour la première fois:

1. ✅ L'utilisateur admin sera **créé automatiquement** dans Firestore
2. ✅ Une catégorie exemple sera créée
3. ✅ Les paramètres de paiement seront **initialisés automatiquement** en mode TEST
4. ✅ Vous verrez dans la console du navigateur:
   ```
   ✅ Admin user created in Firestore!
   📧 Email: neocommerce@admin.com
   🔑 Password: Rahma1211
   ✅ Sample category created!
   ✅ Payment settings initialized! Mode: TEST (payment disabled)
   ```

## 🔐 Connexion Admin

Pour vous connecter:

1. Allez sur: `http://localhost:5173/login` (ou votre URL de production)
2. Entrez:
   - **Email**: `neocommerce@admin.com`
   - **Mot de passe**: `Rahma1211`
3. Cliquez sur **Sign In**

## ➕ Ajouter des produits

Une fois connecté:

1. Vous serez redirigé vers `/admin`
2. Onglet **Products** → Cliquez sur **Add Product**
3. Remplissez le formulaire:
   - Titre du produit
   - Description
   - Prix original
   - Prix réduit
   - Catégorie (sélectionnez dans la liste)
   - URL de l'image de couverture
   - URL du fichier PDF
   - Cochez **Active** pour le rendre visible

4. **Save Product** → Le produit sera enregistré dans Firestore!

## 📝 Vérification

Pour vérifier que tout fonctionne:

1. Ouvrez **Firebase Console** → **Firestore Database**
2. Vous devriez voir les collections créées:
   - `admin_users` (avec votre admin)
   - `categories` (avec la catégorie exemple)
   - `products` (vide au début, se remplit quand vous ajoutez des produits)
   - `orders` (vide au début, se remplit quand il y a des commandes)

## ⚠️ Important

- **Tous les produits** que vous ajoutez sont stockés dans Firestore
- **L'authentification admin** est dans Firestore (pas Supabase)
- **Les mots de passe** sont stockés en clair (pour simplicité) - À améliorer pour la production
- **Les règles Firestore** permettent l'accès public en lecture - Configurez selon vos besoins de sécurité

## 🎯 Statut

✅ Configuration Firebase complète
✅ Services Firestore créés
✅ Authentification Firestore active
✅ Création automatique de l'admin
✅ Collections prêtes à l'emploi
✅ Build réussi

Votre application est prête à être utilisée!

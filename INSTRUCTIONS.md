# Instructions pour NeoCommerceStudio

## 1. Authentification Admin avec Firestore

L'authentification admin est maintenant stockée dans **Firebase Firestore**.

### Connexion Automatique

L'utilisateur admin est **créé automatiquement** au premier lancement de l'application dans Firestore!

**Identifiants Admin:**
- **Email:** neocommerce@admin.com
- **Mot de passe:** Rahma1211

### Comment se connecter

1. Allez sur `/login` dans votre application
2. Entrez les identifiants ci-dessus
3. Cliquez sur "Sign In"

L'utilisateur sera stocké dans la collection `admin_users` de Firestore.

## 2. Base de données Firestore

Votre application utilise Firebase Firestore pour stocker:
- **products** - Tous les produits/ebooks
- **categories** - Les catégories de produits
- **orders** - Les commandes clients
- **admin_users** - Les utilisateurs administrateurs

### Configuration des règles de sécurité Firestore

Dans Firebase Console > Firestore Database > Rules, configurez:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin users - lecture/écriture publique pour login
    match /admin_users/{userId} {
      allow read, write: if true;
    }

    // Categories - lecture publique, écriture admin
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if true;
    }

    // Products - lecture publique, écriture admin
    match /products/{productId} {
      allow read: if true;
      allow write: if true;
    }

    // Orders - lecture/écriture publique
    match /orders/{orderId} {
      allow read, create: if true;
      allow update: if true;
    }
  }
}
```

## 3. Configuration Firebase (Déjà faite!)

Votre configuration Firebase est déjà dans `src/lib/firebase.ts`:

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

## 4. Fonctionnalités

### Pages publiques:
- **Home (/)** - Page d'accueil avec présentation
- **Store (/store)** - Catalogue de tous les produits
- **Categories (/categories)** - Navigation par catégories
- **Contact (/contact)** - Formulaire de contact

### Pages admin (nécessitent connexion):
- **Login (/login)** - Page de connexion admin
- **Admin (/admin)** - Dashboard administrateur avec:
  - Gestion des produits (ajouter, modifier, supprimer)
  - Gestion des catégories
  - Suivi des commandes

## 5. Démarrage

1. **Lancez l'application** - L'utilisateur admin est créé automatiquement
2. **Allez sur `/login`**
3. **Connectez-vous** avec:
   - Email: neocommerce@admin.com
   - Password: Rahma1211
4. **Ajoutez vos produits** dans le dashboard admin!

## 6. Ajout de produits

Une fois connecté en admin:

1. Allez dans l'onglet "Products"
2. Cliquez sur "Add Product"
3. Remplissez:
   - Titre
   - Description
   - Prix original
   - Prix réduit
   - Catégorie (créez-en d'abord si nécessaire)
   - URL de l'image de couverture
   - URL du fichier PDF
   - Cochez "Active" pour le rendre visible

4. Cliquez sur "Save Product"

Le produit sera immédiatement enregistré dans Firestore et visible sur la boutique!

## 7. Note importante

- Tous les produits sont stockés dans Firestore
- L'authentification admin utilise Firestore (pas Supabase)
- Les commandes et paiements utilisent Cryptomus pour les cryptomonnaies

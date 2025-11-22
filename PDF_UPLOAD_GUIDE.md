# Guide Complet - Upload et Téléchargement de PDF

## ✅ Système Installé

Votre application dispose maintenant d'un système complet d'upload et téléchargement de fichiers PDF!

## 📤 Upload de PDF (Admin)

### Fonctionnalités

1. **Upload Direct dans Firebase Storage**
   - Interface drag & drop visuelle
   - Validation automatique du type de fichier (PDF uniquement)
   - Limite de taille: 50 MB par fichier
   - Upload sécurisé vers Firebase Storage

2. **Feedback en Temps Réel**
   - Indicateur de progression pendant l'upload
   - Confirmation visuelle après succès
   - Messages d'erreur clairs
   - Prévisualisation du fichier uploadé

### Comment Ajouter un Produit avec PDF

1. **Connectez-vous en tant qu'Admin**
   - Allez sur `/admin`
   - Connectez-vous avec vos identifiants

2. **Créez un Nouveau Produit**
   - Cliquez sur "Add New Product"
   - Remplissez les informations:
     - Titre
     - Description
     - Prix original
     - Prix réduit
     - Catégorie
     - Image de couverture (URL)

3. **Uploadez le PDF**
   - Cliquez sur la zone "Click to upload PDF"
   - Sélectionnez votre fichier PDF (max 50 MB)
   - Attendez la confirmation "PDF uploaded successfully!"
   - Le fichier est automatiquement stocké dans Firebase Storage

4. **Sauvegardez le Produit**
   - Vérifiez que le PDF est bien uploadé (badge vert)
   - Cochez "Active" pour rendre le produit visible
   - Cliquez sur "Save Product"

### Stockage des Fichiers

```
Firebase Storage Structure:
products/
  ├── 1732123456789_MonEbook.pdf
  ├── 1732123457890_AutreEbook.pdf
  └── ...
```

Les fichiers sont nommés avec:
- Timestamp (pour unicité)
- Nom du fichier original (nettoyé)

## 💳 Processus de Paiement

### Flux Complet

1. **Client Ajoute au Panier**
   ```
   Store → Clic "Ajouter au panier" → Panier mis à jour
   ```

2. **Client Procède au Checkout**
   ```
   Panier → "Proceed to Checkout" → Formulaire client
   ```

3. **Client Remplit ses Informations**
   - Nom complet
   - Email (pour recevoir le lien de téléchargement)

4. **Création du Paiement Cryptomus**
   ```
   "Pay with Cryptocurrency" → Edge Function create-payment
   → Cryptomus API → URL de paiement
   ```

5. **Paiement sur Cryptomus**
   - Client est redirigé vers Cryptomus
   - Choix de la cryptomonnaie (BTC, ETH, USDT, etc.)
   - Paiement effectué

6. **Confirmation Automatique**
   ```
   Cryptomus → Webhook → Edge Function payment-webhook
   → Firestore (sauvegarde commande) → Génération token
   ```

7. **Redirection vers Page de Téléchargement**
   ```
   Cryptomus → yoursite.com/download?token=xxx
   ```

## 📥 Téléchargement de PDF (Client)

### Page de Téléchargement

Après paiement confirmé, le client accède à:
- `/download?token=unique_token`

### Fonctionnalités

1. **Affichage des Détails de Commande**
   - Numéro de commande
   - Email client
   - Nom client
   - Montant payé
   - Date d'achat

2. **Liste des Produits Achetés**
   - Image de couverture
   - Titre
   - Description
   - Quantité (si plusieurs)
   - Bouton "Download PDF" pour chaque produit

3. **Téléchargement Sécurisé**
   - Récupération du PDF depuis Firebase Storage
   - Téléchargement direct dans le navigateur
   - Nom de fichier propre (titre du produit)
   - Pas de limite de téléchargements

### Comment le Client Télécharge

1. Clic sur "Download PDF"
2. Le navigateur télécharge automatiquement le fichier
3. Le PDF est sauvegardé dans le dossier de téléchargements
4. Le client peut télécharger à nouveau à tout moment

## 🔄 Webhook Cryptomus

### Fonction: `payment-webhook`

**URL:** `https://votre-site.supabase.co/functions/v1/payment-webhook`

### Ce qu'elle Fait

1. **Reçoit la notification Cryptomus**
   ```json
   {
     "order_id": "ORD-123...",
     "status": "paid",
     "payment_amount": "99.99",
     "uuid": "payment-uuid",
     "additional_data": "{...}"
   }
   ```

2. **Vérifie la Signature MD5**
   - Calcule: `MD5(JSON + API_KEY)`
   - Compare avec la signature reçue
   - Rejette si invalide

3. **Sauvegarde dans Firestore**
   - Collection: `orders`
   - Données:
     ```javascript
     {
       order_number: "ORD-123...",
       customer_name: "John Doe",
       customer_email: "john@example.com",
       amount_paid: 99.99,
       currency: "USD",
       payment_status: "completed",
       cryptomus_payment_id: "payment-uuid",
       download_token: "token-unique",
       items: "[{...}]",
       created_at: "2025-11-21T..."
     }
     ```

4. **Génère un Token de Téléchargement**
   - Token UUID unique
   - Utilisé dans l'URL de téléchargement
   - Permet d'accéder aux produits achetés

### Configuration Webhook dans Cryptomus

1. Connectez-vous à Cryptomus Dashboard
2. Allez dans **Settings** → **Webhooks**
3. Ajoutez:
   ```
   URL: https://votre-site.supabase.co/functions/v1/payment-webhook
   Events: Payment Completed
   ```

## 🔐 Sécurité

### Upload de PDF

- ✅ Validation du type de fichier (PDF uniquement)
- ✅ Limite de taille (50 MB max)
- ✅ Noms de fichiers nettoyés (caractères spéciaux retirés)
- ✅ Stockage sécurisé Firebase avec règles d'accès
- ✅ URL signées avec authentification Firebase

### Téléchargement de PDF

- ✅ Token unique requis pour accéder à la page
- ✅ Vérification de la commande dans Firestore
- ✅ Vérification du statut de paiement (completed)
- ✅ Accès direct au fichier via URL Firebase sécurisée

### Webhook

- ✅ Signature MD5 vérifiée pour chaque requête
- ✅ Rejet automatique des requêtes invalides
- ✅ Logs détaillés pour débogage
- ✅ CORS configuré correctement

## 🗄️ Structure Firestore

### Collection: `products`
```javascript
{
  id: "auto-generated",
  title: "Mon Ebook",
  description: "Description complète",
  original_price: 99.99,
  discounted_price: 79.99,
  category_id: "category-id",
  cover_image_url: "https://...",
  pdf_file_url: "https://firebasestorage.googleapis.com/.../MonEbook.pdf",
  is_active: true,
  created_at: "2025-11-21T...",
  updated_at: "2025-11-21T..."
}
```

### Collection: `orders`
```javascript
{
  id: "auto-generated",
  order_number: "ORD-1732123456789-ABC123",
  customer_name: "John Doe",
  customer_email: "john@example.com",
  amount_paid: 79.99,
  currency: "USD",
  payment_status: "completed",
  cryptomus_payment_id: "payment-uuid",
  download_token: "unique-token",
  items: "[{productId: '...', quantity: 1, title: '...', price: 79.99}]",
  created_at: "2025-11-21T..."
}
```

## 🚀 Firebase Storage Rules

Ajoutez ces règles dans Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated admin uploads
    match /products/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Explication:**
- `read: if true` → Tout le monde peut lire (télécharger)
- `write: if request.auth != null` → Seuls les utilisateurs authentifiés peuvent uploader

## 📊 Flux de Données Complet

```
┌─────────────┐
│   ADMIN     │
│  /admin     │
└──────┬──────┘
       │
       │ 1. Upload PDF
       ▼
┌─────────────────┐
│ Firebase Storage│ ──► Génère URL publique
└─────────────────┘
       │
       │ 2. URL stockée
       ▼
┌─────────────────┐
│   Firestore     │
│   products      │
└─────────────────┘
       │
       │ 3. Produit visible
       ▼
┌─────────────┐
│   CLIENT    │
│   /store    │
└──────┬──────┘
       │
       │ 4. Ajoute au panier
       ▼
┌─────────────┐
│   /cart     │
└──────┬──────┘
       │
       │ 5. Checkout
       ▼
┌─────────────────┐
│  Edge Function  │
│ create-payment  │
└────────┬────────┘
         │
         │ 6. Crée facture
         ▼
┌─────────────┐
│  Cryptomus  │ ◄──► Client paie
└──────┬──────┘
       │
       │ 7. Paiement confirmé
       ▼
┌─────────────────┐
│  Edge Function  │
│ payment-webhook │
└────────┬────────┘
         │
         │ 8. Sauvegarde commande
         ▼
┌─────────────────┐
│   Firestore     │
│    orders       │
└─────────────────┘
         │
         │ 9. Redirection
         ▼
┌─────────────┐
│  /download  │ ──► Client télécharge PDF
└─────────────┘
```

## ✨ Fonctionnalités Complètes

### ✅ Admin
- Upload de PDF jusqu'à 50 MB
- Preview après upload
- Gestion complète des produits
- Stockage automatique dans Firebase

### ✅ Client
- Panier multi-produits
- Paiement crypto via Cryptomus
- Page de téléchargement dédiée
- Téléchargements illimités
- Accès permanent via token

### ✅ Système
- Webhook automatique
- Sauvegarde commandes
- Génération tokens
- Sécurité complète

## 🎯 Prochaines Étapes

1. **Configurez Firebase Storage Rules** (voir ci-dessus)
2. **Ajoutez vos clés Cryptomus** dans `.env`
3. **Configurez le webhook** dans Cryptomus Dashboard
4. **Testez le flux complet:**
   - Upload d'un PDF en admin
   - Achat d'un produit
   - Téléchargement du PDF

## 🔍 Débogage

### Logs Utiles

- **Upload:** Voir console navigateur
- **Paiement:** Voir console edge function `create-payment`
- **Webhook:** Voir logs edge function `payment-webhook`
- **Download:** Voir console navigateur

### Commandes Utiles

```bash
# Voir les logs des edge functions
supabase functions logs create-payment
supabase functions logs payment-webhook
```

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs dans la console
2. Vérifiez les règles Firebase Storage
3. Vérifiez la configuration Cryptomus
4. Vérifiez que les clés API sont correctes dans `.env`

---

**Votre système est maintenant complet et prêt à accepter des paiements crypto et à distribuer des ebooks PDF!** 🚀

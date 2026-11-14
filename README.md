# 🛍 Marché+ — Boutique en ligne

## 🚀 Lancer le projet

```bash
npm install
npx vercel dev
```

Ouvrir : http://localhost:3000

L’API de commande est une fonction serveur Vercel ; `npm run dev` seul lance uniquement Vite et ne permet pas de finaliser une commande.

## ⚙️ Configuration

Configurer les variables suivantes dans l’environnement de déploiement :

- `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` pour l’application (ou `VITE_SUPABASE_KEY` pour les installations existantes).
- `SUPABASE_URL` et `SUPABASE_ANON_KEY` pour la fonction serveur `/api/commandes`.
- `VITE_WHATSAPP` pour le numéro de contact, au format international sans `+` ni espaces.
- `VITE_API_BASE_URL` uniquement pour un build Capacitor, avec l’origine du déploiement Vercel, par exemple `https://marche-plus.vercel.app`.

Ne jamais placer de clé Supabase `service_role` ou de secret PayDunya dans une variable `VITE_*`. La base Supabase doit autoriser la lecture publique du catalogue et appliquer des politiques RLS qui limitent l’accès aux commandes à leur propriétaire, au vendeur concerné et aux administrateurs autorisés. Aucune migration ni politique RLS n’est fournie dans ce dépôt : les vérifier dans Supabase avant la mise en production.

## 📸 Ajouter des photos de produits

Mettez vos photos dans le dossier `public/images/` avec ces noms :
- sac-dos.jpg
- casque.jpg
- lampe.jpg
- montre.jpg
- chaussures.jpg
- carnet.jpg
- thermos.jpg
- clavier.jpg
- lunettes.jpg
- plante.jpg
- stylo.jpg
- chargeur.jpg

## 🌐 Mettre en ligne sur Vercel

```bash
npx vercel
```

Déployer le dépôt sur Vercel pour que les routes `api/` soient exécutées comme fonctions serveur. Un simple hébergement statique de `dist` ne fournit pas l’API de commande.

## ✨ Fonctionnalités
- Boutique avec photos réelles
- Panier + commande en 3 étapes avec paiement à la livraison
- Notification WhatsApp automatique
- Commandes sauvegardées dans Supabase
- Tableau de bord admin

Le paiement en ligne PayDunya est désactivé jusqu’à l’ajout d’une confirmation de paiement serveur liée à une commande persistée.

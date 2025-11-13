<div align="center">
  <h1>Simple CMS</h1>
  <p>Un système de gestion de contenu moderne et complet, construit avec Next.js 15</p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
  [![Tests](https://img.shields.io/badge/tests-342%20passés-brightgreen)](./)

  <p>
    <a href="#fonctionnalités">Fonctionnalités</a> •
    <a href="#démarrage-rapide">Démarrage Rapide</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#stack-technique">Stack Technique</a> •
    <a href="#contribuer">Contribuer</a>
  </p>

  <p>
    <a href="./README.md">🇬🇧 English</a> •
    <a href="./README.fr.md">🇫🇷 Français</a> •
    <a href="./README.es.md">🇪🇸 Español</a>
  </p>
</div>

---

## Aperçu

**Simple CMS** est un système de gestion de contenu prêt pour la production et auto-hébergé, conçu pour les développeurs qui veulent un contrôle total sur leur plateforme de contenu. Construit avec des technologies modernes et les meilleures pratiques, il offre un panneau d'administration puissant, un système de blog flexible et une gestion complète des utilisateurs dès le départ.

## Captures d'écran

<details>
<summary>Cliquez pour voir les captures d'écran</summary>

### Tableau de bord administrateur
![Tableau de bord](./docs/screenshots/dashboard.png)
*Vue d'ensemble des analyses, activité récente et actions rapides*

### Éditeur d'articles
![Éditeur d'articles](./docs/screenshots/post-editor.png)
*Éditeur de texte riche avec Tiptap, prenant en charge markdown, images, tableaux et plus*

### Bibliothèque multimédia
![Bibliothèque multimédia](./docs/screenshots/media-library.png)
*Gestion des médias organisée avec structure de dossiers*

### Gestion des utilisateurs
![Gestion des utilisateurs](./docs/screenshots/user-management.png)
*Gestion complète des utilisateurs avec contrôle d'accès basé sur les rôles*

### Modération des commentaires
![Modération des commentaires](./docs/screenshots/comments.png)
*Modérez les commentaires avec workflow d'approbation/rejet*

### Personnalisation du thème
![Personnalisation du thème](./docs/screenshots/appearance.png)
*Personnalisez les couleurs du thème avec sélecteur de couleurs OKLCH*

</details>

> **Note :** Les captures d'écran sont des espaces réservés. Créez le répertoire `docs/screenshots/` et ajoutez les vraies captures d'écran pour la production.

---

## Stack Technique

| Catégorie | Technologie |
|-----------|-------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Langage** | [TypeScript 5.7](https://www.typescriptlang.org/) |
| **Base de données** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| **Authentification** | [Better Auth](https://better-auth.com/) |
| **Composants UI** | [shadcn/ui](https://ui.shadcn.com/) (style New York) |
| **Styles** | [Tailwind CSS v4](https://tailwindcss.com/) (espace colorimétrique OKLCH) |
| **Éditeur de texte** | [Tiptap](https://tiptap.dev/) |
| **Tests** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| **Gestionnaire de packages** | [pnpm](https://pnpm.io/) |
| **Outil de build** | [Turbopack](https://turbo.build/) |

## ✨ Fonctionnalités

### 📝 Blog & Gestion de Contenu
- ✅ **Éditeur de texte riche** - Éditeur Tiptap avec markdown, tableaux, images, intégrations YouTube, coloration syntaxique
- ✅ **Organisation du contenu** - Articles avec catégories, tags et slugs personnalisés
- ✅ **Gestion du workflow** - Statut brouillon/publié avec publication programmée
- ✅ **Intégration multimédia** - Images de couverture avec optimisation responsive
- ✅ **Système de commentaires** - Workflow de modération avec réponses imbriquées (3 niveaux)
- ✅ **SEO optimisé** - Meta tags, Open Graph, données structurées

### 🛠️ Panneau d'Administration
- ✅ **Gestion des utilisateurs** - Créer, modifier, bannir des utilisateurs avec permissions basées sur les rôles
- ✅ **Gestion des articles** - Opérations CRUD complètes avec actions groupées
- ✅ **Catégories & Tags** - Organisez le contenu avec taxonomie hiérarchique
- ✅ **Modération des commentaires** - Approuver, rejeter ou supprimer des commentaires avec anti-spam
- ✅ **Bibliothèque multimédia** - Télécharger, organiser les fichiers dans des dossiers avec recherche
- ✅ **Personnalisation du thème** - Sélecteur de couleurs en direct avec espace OKLCH
- ✅ **Tableau de bord analytique** - Suivez les utilisateurs, articles, commentaires et stockage

### 🔐 Authentification & Sécurité
- ✅ **Contrôle d'accès basé sur les rôles** - 6 niveaux de rôles (super-admin → utilisateur)
- ✅ **Sessions sécurisées** - Cookies httpOnly avec durée de 30 jours
- ✅ **Vérification email** - Obligatoire pour les nouveaux comptes
- ✅ **Réinitialisation de mot de passe** - Flux sécurisé basé sur jeton par email
- ✅ **Impersonnification utilisateur** - Déboguer les problèmes en tant qu'autre utilisateur (admin seulement)
- ✅ **Limitation de débit** - Protection contre les attaques par force brute
- ✅ **Protection XSS** - Validation et assainissement des entrées
- ✅ **Protection par middleware** - Gardes de routes optimisés pour Edge

### 🎨 Expérience Utilisateur
- ✅ **Mode sombre/clair** - Changement de thème sensible au système
- ✅ **Design responsive** - Mobile-first, fonctionne sur tous les appareils
- ✅ **Accessibilité** - Labels ARIA, navigation au clavier
- ✅ **Notifications toast** - Retour utilisateur pour toutes les actions
- ✅ **États de chargement** - Écrans squelettes et spinners
- ✅ **Gestion des erreurs** - Fallbacks gracieux et boundaries d'erreur

### 🧪 Tests & Qualité
- ✅ **342 tests unitaires** - Couverture de tests complète avec Vitest
- ✅ **TypeScript** - Sécurité de type complète dans tout le code
- ✅ **ESLint** - Qualité et cohérence du code
- ✅ **Prettier** - Formatage automatique du code

---

## 🚀 Démarrage Rapide

### Prérequis

Assurez-vous d'avoir installé :

- **Node.js** 18.x ou supérieur ([Télécharger](https://nodejs.org/))
- **PostgreSQL** 14.x ou supérieur ([Télécharger](https://www.postgresql.org/download/))
- **pnpm** 8.x ou supérieur ([Installer](https://pnpm.io/installation))

### Installation

**1. Cloner le dépôt**

```bash
git clone https://github.com/votreusername/simple-cms.git
cd simple-cms
```

**2. Installer les dépendances**

```bash
pnpm install
```

**3. Configurer les variables d'environnement**

Copiez `.env.example` vers `.env.local` et configurez :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/simple_cms"

# Authentification
BETTER_AUTH_SECRET="votre-clé-secrète-min-32-caractères"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auto-Création Premier Admin (créé automatiquement au premier démarrage du serveur)
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="SecurePassword123!"
SEED_ADMIN_NAME="Super Admin"

# Configuration du Site
NEXT_PUBLIC_SITE_NAME="Mon CMS"
NEXT_PUBLIC_SITE_DESCRIPTION="Un système de gestion de contenu moderne"
NEXT_PUBLIC_SITE_LOGO=""
NEXT_PUBLIC_SITE_FAVICON=""

# Email (optionnel - pour réinitialisation mot de passe)
EMAIL_FROM="noreply@votredomaine.com"
RESEND_API_KEY="re_xxxxx"

# Stockage multimédia (optionnel - pour uploads)
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="simple-cms-media"
NEXT_PUBLIC_MINIO_ENDPOINT="http://localhost:9000"
```

> **Astuce :** Générez une clé secrète sécurisée : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**4. Configurer la base de données**

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations (production)
npx prisma migrate deploy

# OU pour le développement (interactif)
npx prisma migrate dev
```

**5. Lancer le serveur de développement**

```bash
pnpm dev
```

**6. Auto-Création du Premier Admin**

Le premier utilisateur super-admin est **automatiquement créé** au démarrage du serveur en utilisant les identifiants de votre `.env.local` :
- Email : `SEED_ADMIN_EMAIL`
- Mot de passe : `SEED_ADMIN_PASSWORD`
- Nom : `SEED_ADMIN_NAME`

🎉 **Tout est prêt !** Connectez-vous sur [http://localhost:3000/sign-in](http://localhost:3000/sign-in) et accédez au panneau d'administration sur [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📚 Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guide pour les contributeurs
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide de déploiement en production
- **[SECURITY.md](./SECURITY.md)** - Politique de sécurité et bonnes pratiques
- **[CLAUDE.md](./CLAUDE.md)** - Instructions du projet pour Claude Code

---

## 🛠️ Commandes Disponibles

### Développement

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Démarrer le serveur de développement avec Turbopack |
| `pnpm build` | Construire pour la production |
| `pnpm start` | Démarrer le serveur de production |
| `pnpm lint` | Exécuter ESLint |
| `pnpm test` | Exécuter les tests avec Vitest |
| `pnpm test:ui` | Exécuter les tests avec interface |
| `pnpm test:coverage` | Générer le rapport de couverture |

### Base de données

| Commande | Description |
|----------|-------------|
| `pnpm db:generate` | Générer le client Prisma |
| `pnpm db:push` | Pousser les changements de schéma (dev seulement) |
| `pnpm db:migrate` | Créer et appliquer les migrations |
| `pnpm db:migrate:deploy` | Appliquer les migrations (production) |
| `pnpm db:studio` | Ouvrir l'interface Prisma Studio |

---

## 📁 Structure du Projet

```
simple-cms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # 🔒 Routes admin (nécessite auth)
│   │   │   ├── admin/         # Tableau de bord, analyses
│   │   │   ├── posts/         # Gestion des articles
│   │   │   ├── categories/    # Gestion des catégories
│   │   │   ├── tags/          # Gestion des tags
│   │   │   ├── comments/      # Modération des commentaires
│   │   │   ├── media/         # Bibliothèque multimédia
│   │   │   ├── users/         # Gestion des utilisateurs
│   │   │   ├── appearance/    # Personnalisation du thème
│   │   │   └── settings/      # Paramètres généraux
│   │   ├── (auth)/            # 🔓 Pages d'authentification
│   │   │   ├── sign-in/       # Page de connexion
│   │   │   ├── sign-up/       # Page d'inscription
│   │   │   └── reset-password/ # Réinitialisation mot de passe
│   │   ├── (blog)/            # 📝 Routes blog publiques
│   │   │   └── blog/          # Liste et détail des articles
│   │   ├── (site)/            # 🌐 Routes site publiques
│   │   │   └── about/         # Page à propos
│   │   └── api/               # Routes API
│   │       └── auth/          # Point de terminaison Better Auth
│   │
│   ├── features/              # Modules par fonctionnalité
│   │   ├── auth/             # Authentification & sessions
│   │   │   ├── components/   # Formulaires connexion, inscription
│   │   │   ├── lib/          # Config Better Auth, actions
│   │   │   └── provider/     # Provider de session
│   │   ├── admin/            # Fonctionnalité admin
│   │   │   ├── components/   # Composants UI admin
│   │   │   └── lib/          # Actions serveur (users, media, settings)
│   │   ├── blog/             # Fonctionnalités blog/CMS
│   │   │   ├── components/   # Éditeur d'articles, dialogues
│   │   │   └── lib/          # Actions serveur (posts, comments)
│   │   └── theme/            # Gestion du thème
│   │       ├── components/   # Sélecteur de thème
│   │       └── provider/     # Provider de thème
│   │
│   ├── components/           # Composants UI partagés
│   │   ├── ui/              # Composants shadcn/ui
│   │   ├── rich-text-editor.tsx # Éditeur Tiptap
│   │   ├── color-picker.tsx     # Sélecteur couleurs OKLCH
│   │   └── multi-select.tsx     # Sélecteur de tags
│   │
│   └── lib/                 # Utilitaires partagés
│       ├── prisma.ts       # Client Prisma centralisé (singleton)
│       ├── auto-seed.ts    # Auto-création premier admin depuis variables env
│       ├── site-config.ts  # Paramètres du site depuis variables env
│       ├── roles.ts        # Définitions rôles et permissions
│       ├── utils.ts        # Fonctions helper
│       └── metadata.ts     # Métadonnées SEO
│
├── prisma/                  # Schéma base de données
│   ├── schema.prisma       # Schéma principal (generator + datasource)
│   ├── users.prisma        # Modèles User, Session, Account
│   ├── post.prisma         # Modèles Post, Category, Tag
│   ├── comment.prisma      # Modèle Comment
│   └── media.prisma        # Modèles Media, MediaFolder
│
├── tests/                   # Fichiers de test
│   ├── features/           # Tests par fonctionnalité
│   └── components/         # Tests de composants
│
├── docs/                    # Documentation
│   └── screenshots/        # Captures d'écran pour README
│
├── instrumentation.ts       # Démarrage serveur Next.js (auto-seed admin)
├── CONTRIBUTING.md          # Guide de contribution
├── DEPLOYMENT.md            # Guide de déploiement
├── SECURITY.md              # Politique de sécurité
└── CLAUDE.md                # Instructions Claude Code
```

---

## 🔑 Décisions Architecturales Clés

### Structure Basée sur les Fonctionnalités
- **Design modulaire :** Chaque fonctionnalité est autonome avec composants, actions et logique
- **Évolutivité :** Facile d'ajouter de nouvelles fonctionnalités sans affecter le code existant
- **Maintenabilité :** Séparation claire des préoccupations

### Client Prisma Centralisé
- **Importer depuis :** `@/lib/prisma` (PAS `@/generated/prisma`)
- **Pattern singleton :** Empêche les connexions multiples à la base de données
- **Chemin de sortie personnalisé :** `generated/prisma` pour des imports plus propres

### Pattern Actions Serveur
- **Emplacement :** Toutes les actions dans `features/*/lib/*-actions.ts`
- **Jamais dans les routes app :** Garde les pages légères et focalisées sur le rendu
- **Réponses standardisées :** Pattern `{ data, error }` pour la cohérence

### Multi-Schéma Prisma
- **Organisé par domaine :** `users.prisma`, `post.prisma`, `comment.prisma`, `media.prisma`
- **Fusion automatique :** Via `prisma.config.ts`
- **Meilleure maintenabilité :** Plus facile de naviguer et comprendre le schéma

### Contrôle d'Accès Basé sur les Rôles
- **6 niveaux de rôles :** super-admin, admin, editor, moderator, author, user
- **Permissions granulaires :** Contrôle d'accès au niveau des fonctionnalités
- **Protection middleware :** Gardes de routes optimisés Edge
- **Défini dans :** `src/lib/roles.ts` et `src/lib/route-permissions.ts`

---

## 🤝 Contribuer

Nous accueillons les contributions ! Veuillez lire notre guide [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus de détails sur :

- Code de conduite
- Configuration du développement
- Standards de code
- Processus de pull request
- Guidelines de test

**Étapes rapides pour contribuer :**

1. Forker le dépôt
2. Créer une branche de fonctionnalité : `git checkout -b feature/fonctionnalite-incroyable`
3. Commiter vos changements : `git commit -m 'feat: ajouter fonctionnalité incroyable'`
4. Pousser vers la branche : `git push origin feature/fonctionnalite-incroyable`
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

## 🙏 Remerciements

Construit avec ces incroyables projets open-source :

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - ORM base de données
- [Better Auth](https://better-auth.com/) - Bibliothèque d'authentification
- [shadcn/ui](https://ui.shadcn.com/) - Bibliothèque de composants UI
- [Tiptap](https://tiptap.dev/) - Éditeur de texte riche
- [Tailwind CSS](https://tailwindcss.com/) - CSS utility-first
- [Vitest](https://vitest.dev/) - Framework de test

---

## 📞 Support

- **Documentation :** [CONTRIBUTING.md](./CONTRIBUTING.md) | [DEPLOYMENT.md](./DEPLOYMENT.md) | [SECURITY.md](./SECURITY.md)
- **Issues :** [GitHub Issues](https://github.com/votreusername/simple-cms/issues)
- **Discussions :** [GitHub Discussions](https://github.com/votreusername/simple-cms/discussions)
- **Sécurité :** Voir [SECURITY.md](./SECURITY.md) pour signaler des vulnérabilités

---

<div align="center">
  <p>Fait avec ❤️ par des développeurs, pour des développeurs</p>
  <p>
    <a href="https://github.com/votreusername/simple-cms">⭐ Star sur GitHub</a> •
    <a href="https://github.com/votreusername/simple-cms/issues">🐛 Signaler un Bug</a> •
    <a href="https://github.com/votreusername/simple-cms/issues">✨ Demander une Fonctionnalité</a>
  </p>
</div>

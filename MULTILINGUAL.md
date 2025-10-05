# Guide Multi-langue

Ce CMS supporte maintenant plusieurs langues (français et anglais par défaut). Voici comment utiliser cette fonctionnalité.

## Architecture

### Structure des fichiers
```
src/
├── i18n/
│   ├── routing.ts          # Configuration du routing i18n
│   └── request.ts          # Configuration des requêtes i18n
├── features/i18n/
│   ├── lib/
│   │   ├── i18n-config.ts  # Configuration des locales
│   │   └── helpers.ts      # Fonctions utilitaires
│   └── components/
│       ├── locale-switcher.tsx      # Sélecteur de langue
│       └── translation-tabs.tsx     # Onglets de traduction
├── messages/
│   ├── fr.json            # Traductions françaises
│   └── en.json            # Traductions anglaises
└── app/
    └── [locale]/          # Routes localisées
        ├── (admin)/
        ├── (auth)/
        ├── (blog)/
        └── (site)/
```

### Modèles Prisma

Trois nouveaux modèles ont été ajoutés pour stocker les traductions :

- **PostTranslation** : Traductions des articles (title, slug, excerpt, content)
- **CategoryTranslation** : Traductions des catégories (name, slug, description)
- **TagTranslation** : Traductions des tags (name, slug)

Chaque modèle principal (Post, Category, Tag) a également un champ `defaultLocale` pour définir la langue par défaut du contenu.

## Configuration

### Ajouter une nouvelle langue

1. Modifier `src/features/i18n/lib/i18n-config.ts` :
```typescript
export const locales = ["fr", "en", "es"] as const; // Ajouter "es"

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español", // Ajouter
};

export const localeFlags: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  es: "🇪🇸", // Ajouter
};
```

2. Créer le fichier de traductions `src/messages/es.json` en copiant `fr.json` ou `en.json`

3. Mettre à jour `src/i18n/routing.ts` :
```typescript
export const routing = defineRouting({
  locales: ["fr", "en", "es"], // Ajouter "es"
  defaultLocale: "fr",
  localePrefix: "as-needed",
});
```

## Utilisation

### Dans les composants React

#### Utiliser les traductions
```typescript
"use client";

import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("common");

  return (
    <button>{t("save")}</button>
  );
}
```

#### Créer des liens localisés
```typescript
import { Link } from "@/i18n/routing";

export function MyComponent() {
  return (
    <Link href="/blog">Blog</Link>
  );
}
```

#### Navigation programmatique
```typescript
"use client";

import { useRouter, usePathname } from "@/i18n/routing";

export function MyComponent() {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToBlog = () => {
    router.push("/blog");
  };

  return <button onClick={navigateToBlog}>Go to Blog</button>;
}
```

### Dans les Server Components

```typescript
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("blog");

  return <h1>{t("title")}</h1>;
}
```

### Dans les Server Actions

Les Server Actions pour les traductions sont disponibles dans :

- `src/features/blog/lib/post-translation-actions.ts`
- `src/features/blog/lib/category-translation-actions.ts`
- `src/features/blog/lib/tag-translation-actions.ts`

#### Exemple : Créer une traduction de post
```typescript
import { upsertPostTranslationAction } from "@/features/blog/lib/post-translation-actions";

const result = await upsertPostTranslationAction({
  postId: "post-id",
  locale: "en",
  title: "My Post Title",
  excerpt: "A short description",
  content: "Full post content...",
});
```

#### Exemple : Récupérer un post avec ses traductions
```typescript
import { getPostBySlugAction } from "@/features/blog/lib/post-translation-actions";

const { data: post } = await getPostBySlugAction("my-post-slug", "en");
// Le post sera automatiquement traduit en anglais si disponible
```

#### Exemple : Lister les posts par locale
```typescript
import { listPostsByLocaleAction } from "@/features/blog/lib/post-translation-actions";

const { data } = await listPostsByLocaleAction({
  locale: "en",
  published: true,
  limit: 10,
});
// Retourne les posts avec leurs traductions anglaises
```

## Composants Admin

### TranslationTabs

Utilisez ce composant pour créer des formulaires multi-langues dans l'admin :

```typescript
import { TranslationTabs } from "@/features/i18n/components/translation-tabs";
import type { Locale } from "@/features/i18n/lib/i18n-config";

export function PostForm({ post }) {
  const completedLocales: Locale[] = post.translations.map(t => t.locale);

  return (
    <TranslationTabs
      defaultLocale={post.defaultLocale}
      completedLocales={completedLocales}
    >
      {(locale) => (
        <div>
          <Input
            name={`title-${locale}`}
            placeholder={`Titre (${locale})`}
          />
          {/* Autres champs... */}
        </div>
      )}
    </TranslationTabs>
  );
}
```

### LocaleSwitcher

Le sélecteur de langue est déjà intégré dans le footer (desktop et mobile). Pour l'ajouter ailleurs :

```typescript
import { LocaleSwitcher } from "@/features/i18n/components/locale-switcher";

export function Header() {
  return (
    <header>
      <LocaleSwitcher />
    </header>
  );
}
```

## Routing

### Structure des URLs

Avec `localePrefix: "as-needed"`, les URLs sont structurées comme suit :

- Langue par défaut (fr) : `/blog`, `/admin/posts`
- Autres langues : `/en/blog`, `/en/admin/posts`

### Génération de slugs

Les slugs sont automatiquement générés pour chaque langue via la fonction `generateSlug` :

```typescript
import { generateSlug } from "@/features/i18n/lib/helpers";

const slug = generateSlug("Mon Article");
// Résultat: "mon-article"
```

## Middleware

Le middleware gère automatiquement :
- La détection de la langue préférée de l'utilisateur
- La redirection vers la bonne locale
- La préservation de la locale dans les redirections d'authentification

## Bonnes pratiques

1. **Toujours définir defaultLocale** : Lors de la création de contenu, définissez la langue par défaut
2. **Traductions complètes** : Assurez-vous que les traductions critiques (title, excerpt) sont disponibles dans toutes les langues
3. **Fallback** : Le système utilise automatiquement la langue par défaut si une traduction n'existe pas
4. **SEO** : Les slugs sont générés pour chaque langue, permettant des URLs optimisées SEO

## Dépannage

### La langue ne change pas
- Vérifiez que vous utilisez `Link` de `@/i18n/routing` et non `next/link`
- Assurez-vous que `setRequestLocale(locale)` est appelé dans les Server Components

### Traductions manquantes
- Vérifiez que le fichier JSON existe dans `src/messages/`
- Vérifiez la structure des clés dans le fichier JSON
- Redémarrez le serveur de développement après modification des fichiers de traduction

### Erreurs de routing
- Vérifiez que tous les fichiers dans `app/[locale]/` ont les bons types pour `params`
- Assurez-vous que `generateStaticParams` est défini dans les layouts/pages dynamiques

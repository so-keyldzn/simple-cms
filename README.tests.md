# Tests - Guide Complet

Ce projet utilise **Vitest** pour les tests unitaires et d'intégration.

## 🚀 Lancer les tests

### Mode Watch (développement)
```bash
pnpm test
```
Les tests se relancent automatiquement à chaque modification.

### Mode UI (interface graphique)
```bash
pnpm test:ui
```
Lance une interface web pour visualiser et déboguer les tests.

### Run Once (CI/CD)
```bash
pnpm test:run
```
Lance les tests une seule fois (idéal pour CI/CD).

### Coverage (couverture de code)
```bash
pnpm test:coverage
```
Génère un rapport de couverture de code dans `coverage/`.

## 📁 Structure des Tests

```
src/
├── lib/
│   └── __tests__/
│       ├── roles.test.ts       # Tests du système de rôles
│       └── utils.test.ts       # Tests des utilitaires
├── features/
│   ├── auth/
│   │   └── components/
│   │       └── __tests__/
│   │           └── sign-in.test.tsx
│   └── blog/
│       └── lib/
│           └── __tests__/
│               └── slug.test.ts
└── components/
    └── ui/
        └── __tests__/
            ├── button.test.tsx
            └── card.test.tsx
```

## 📊 Tests Actuels

### ✅ Tests Utilitaires (35 tests)

**Système de Rôles** (`roles.test.ts`)
- ✓ Vérification des permissions par rôle
- ✓ Support des rôles multiples (comma-separated)
- ✓ Gestion des cas undefined/null

**Utilitaires** (`utils.test.ts`)
- ✓ Fusion de classes CSS (cn)
- ✓ Gestion des conflits Tailwind
- ✓ Classes conditionnelles

**Génération de Slugs** (`slug.test.ts`)
- ✓ Conversion de titres en slugs
- ✓ Gestion des accents (français, espagnol, etc.)
- ✓ Caractères spéciaux
- ✓ Espaces multiples

### ✅ Tests Composants (15 tests)

**Button** (`button.test.tsx`)
- ✓ Rendu avec différentes variantes (default, destructive, outline, ghost)
- ✓ Tailles (sm, lg, icon)
- ✓ État disabled
- ✓ AsChild pattern

**Card** (`card.test.tsx`)
- ✓ Rendu de tous les sous-composants
- ✓ Styles personnalisés
- ✓ ClassName merging

**SignIn** (`sign-in.test.tsx`)
- ✓ Formulaire complet
- ✓ Inputs email/password
- ✓ Lien "Forgot password"
- ✓ Checkbox "Remember me"

## 🧪 Écrire de Nouveaux Tests

### Test Unitaire (Fonction)

```typescript
import { describe, it, expect } from 'vitest'

describe('Ma Fonction', () => {
  it('should do something', () => {
    expect(maFonction('input')).toBe('output')
  })
})
```

### Test de Composant

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MonComposant from './MonComposant'

describe('MonComposant', () => {
  it('should render correctly', () => {
    render(<MonComposant />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Mock (Simuler des dépendances)

```typescript
import { vi } from 'vitest'

// Mock d'un module
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock d'une fonction
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')
```

## 🎯 Bonnes Pratiques

### 1. **Test ce qui compte**
- ✅ Logique métier
- ✅ Transformations de données
- ✅ Comportements utilisateur
- ❌ Détails d'implémentation

### 2. **Nommage Clair**
```typescript
// ✅ Bon
it('should return error when email is invalid', () => {})

// ❌ Mauvais
it('test 1', () => {})
```

### 3. **Un test = Un concept**
```typescript
// ✅ Bon
it('should validate email format', () => {})
it('should validate password length', () => {})

// ❌ Mauvais
it('should validate form', () => {
  // teste email ET password ET submit
})
```

### 4. **Utiliser les Matchers Appropriés**
```typescript
// ✅ Bon
expect(button).toBeDisabled()
expect(element).toBeInTheDocument()

// ❌ Moins lisible
expect(button.disabled).toBe(true)
```

## 🔧 Configuration

### `vitest.config.ts`
- Environment: jsdom (pour React)
- Setup file: `vitest.setup.ts`
- Coverage provider: v8
- Path aliases: `@/` → `./src/`

### `vitest.setup.ts`
- Import de `@testing-library/jest-dom`
- Cleanup automatique après chaque test

## 📈 Objectifs de Couverture

| Catégorie | Objectif |
|-----------|----------|
| **Utilitaires (lib/)** | 90%+ |
| **Composants UI** | 80%+ |
| **Server Actions** | 70%+ |
| **Composants Pages** | 60%+ |

## 🐛 Debugging

### Tests qui échouent
```bash
# Mode verbose
pnpm test -- --reporter=verbose

# Un seul fichier
pnpm test roles.test.ts

# Un seul test
pnpm test -t "should return true when super-admin"
```

### UI pour Debug
```bash
pnpm test:ui
```
Ouvrez http://localhost:51204 pour une interface graphique.

## 🚀 CI/CD

Ajoutez dans votre pipeline :

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: pnpm test:run

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## 📚 Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Happy Testing! 🎉**

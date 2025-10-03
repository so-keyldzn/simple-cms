# Contributing to simple cms

Thank you for your interest in contributing to simple cms! 🎉

This document provides guidelines for contributing to the project. By participating in this project, you agree to abide by our code of conduct.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Environment Setup](#development-environment-setup)
- [Project Architecture](#project-architecture)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)
- [Commit Conventions](#commit-conventions)
- [Testing](#testing)
- [Resources](#resources)

## 🤝 Code of Conduct

This project and all participants are governed by a code of conduct. By participating, you agree to abide by this code:

- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## 🚀 How to Contribute

### Reporting Bugs

Bugs are tracked via [GitHub Issues](https://github.com/haezclub/cms/issues). Before creating a bug report:

1. **Check** that the bug hasn't already been reported
2. **Use** a clear and descriptive title
3. **Describe** the exact steps to reproduce the problem
4. **Provide** specific details (version, OS, browser, etc.)
5. **Add** screenshots if possible

**Bug Report Template:**

```markdown
**Description**
A clear description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. Bug appears

**Expected Behavior**
What should happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120]
- Node Version: [e.g. 20.11.0]
- CMS Version: [e.g. 0.1.0]
```

### Proposing New Features

Feature requests are also managed via [GitHub Issues](https://github.com/haezclub/cms/issues).

**Feature Request Template:**

```markdown
**Related Issue**
Describe the problem this feature would solve.

**Proposed Solution**
A clear description of what you want.

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Screenshots, examples, etc.
```

### Contributing Code

1. **Fork** the repository
2. **Create** a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'feat: add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

## 💻 Development Environment Setup

### Prerequisites

- **Node.js** >= 20.11.0
- **pnpm** >= 8.15.0
- **PostgreSQL** >= 14
- **MinIO** (optional, for media storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/haezclub/cms.git
   cd cms
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/cms"
   BETTER_AUTH_SECRET="your-secret-key-here"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Create tables
   npx prisma db push

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - App: http://localhost:3000
   - Prisma Studio: `npx prisma studio`

### Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Lint code
pnpm lint:fix         # Auto-fix lint errors

# Database
npx prisma studio     # GUI interface for DB
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema to DB
npx prisma migrate dev # Create migration

# Tests
pnpm test             # Run all tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
pnpm test:ui          # Vitest UI interface
```

## 🏗️ Project Architecture

### Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin route group (with sidebar)
│   ├── (auth)/            # Authentication route group
│   ├── (blog)/            # Public blog route group
│   ├── (site)/            # Public site route group
│   └── api/               # API Routes
├── features/              # Feature-based architecture
│   ├── admin/             # Admin panel
│   │   ├── components/    # Admin components
│   │   └── lib/          # Admin Server Actions
│   ├── auth/              # Authentication (Better Auth)
│   ├── blog/              # Blog/CMS
│   ├── onboard/           # Onboarding
│   └── theme/             # Theme management
├── components/            # Shared components
│   └── ui/               # shadcn/ui components
├── lib/                   # Shared utilities
│   ├── prisma.ts         # Centralized Prisma client
│   ├── roles.ts          # RBAC system
│   └── utils.ts          # Helpers
├── emails/                # Email templates (React Email)
└── middleware.ts          # Next.js middleware
```

### Architectural Principles

1. **Feature-based structure**: Each feature is self-contained with its components, actions, and types
2. **Server Actions**: All server-side mutations use Server Actions
3. **Centralized Prisma Client**: Always import from `@/lib/prisma`
4. **Type Safety**: Strict TypeScript, Zod type inference
5. **Role-Based Access Control**: Granular permissions by role

## 📏 Code Standards

### TypeScript

- **No `any`**: Use `unknown` or appropriate types
- **Interfaces** for complex objects
- **Types** for unions and primitives
- **Zod** for runtime validation

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}

const userSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
});

// ❌ Bad
function getUser(data: any) {
  return data.user;
}
```

### React / Next.js

- **Server Components by default**: Use `"use client"` only when necessary
- **Composition** over props drilling
- **Named exports** for components
- **Co-location**: Place related files together

```tsx
// ✅ Good - Server Component
export function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => <UserItem key={user.id} user={user} />)}
    </ul>
  );
}

// ✅ Good - Client Component (when necessary)
"use client";
export function UserDropdown() {
  const [open, setOpen] = useState(false);
  // ... necessary hooks
}
```

### CSS / Styling

- **Tailwind CSS** for styling
- **CSS Variables** for theme colors
- **OKLCH** for colors
- **Utility-first** approach

```tsx
// ✅ Good
<button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
  Click me
</button>

// ❌ Bad - No inline styles
<button style={{ backgroundColor: "blue", padding: "8px" }}>
  Click me
</button>
```

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`
- **Server Actions**: `Action` suffix (e.g. `createUserAction`)

```typescript
// File: user-profile.tsx
export function UserProfile() {} // Component
export async function getUserAction() {} // Server Action
export const MAX_FILE_SIZE = 5_000_000; // Constant
export type UserRole = "admin" | "user"; // Type
```

### Comments

- **Comment the "why"**, not the "what"
- **JSDoc** for public functions
- **TODO** with a ticket/issue number

```typescript
// ✅ Good
/**
 * Creates a new user and sends a verification email.
 * Note: Email verification is disabled for super-admins.
 */
export async function createUserAction(data: CreateUserInput) {
  // Auto-verify super-admins to avoid email dependency issues
  const emailVerified = data.role === "super-admin";
  // ...
}

// ❌ Bad
// This function creates a user
export async function createUserAction(data: any) {
  // Create the user
  const user = await prisma.user.create({
    // The data
    data: data,
  });
}
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code compiles without errors (`pnpm build`)
- [ ] All tests pass (`pnpm test`)
- [ ] Linter passes (`pnpm lint`)
- [ ] New components have tests
- [ ] Documentation is up to date
- [ ] Commits follow conventions

### PR Description

Use this template:

```markdown
## Description
Describe the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes a bug)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (change that breaks compatibility)
- [ ] Documentation update

## How to Test
1. Go to '...'
2. Click on '...'
3. Verify that '...'

## Checklist
- [ ] Code compiles
- [ ] Tests pass
- [ ] Lint passes
- [ ] Documentation up to date
- [ ] Changes tested manually

## Screenshots (if applicable)
```

### Review Process

1. **At least 1 review** required
2. **CI must pass** (tests + lint)
3. **No conflicts** with main
4. **Squash merge** preferred to keep history clean

## 📝 Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting (no code change)
- **refactor**: Refactoring (neither feat nor fix)
- **perf**: Performance improvement
- **test**: Adding or modifying tests
- **chore**: Maintenance (dependencies, config, etc.)
- **ci**: CI/CD changes

### Examples

```bash
# New feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(blog): resolve infinite scroll loading issue"

# Documentation
git commit -m "docs(readme): add installation instructions"

# Refactoring
git commit -m "refactor(admin): extract user table into separate component"

# Breaking change
git commit -m "feat(api)!: change user endpoint response format

BREAKING CHANGE: user endpoint now returns { data: User } instead of User directly"
```

### Scope

The scope generally corresponds to the feature:
- `auth` - Authentication
- `blog` - Blog/CMS
- `admin` - Admin panel
- `onboard` - Onboarding
- `theme` - Theme
- `api` - API routes
- `db` - Database

## 🧪 Testing

### Guidelines

- **Write tests** for every new feature
- **Unit tests** for business logic
- **Component tests** for React components
- **Minimum coverage**: 70%

### Test Structure

```typescript
// __tests__/user-actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserAction } from '../user-actions';

describe('user-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserAction', () => {
    it('creates user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123',
      };

      // Act
      const result = await createUserAction(userData);

      // Assert
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('returns error with invalid email', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'SecurePass123',
      };

      // Act
      const result = await createUserAction(userData);

      // Assert
      expect(result.data).toBeNull();
      expect(result.error).toContain('email');
    });
  });
});
```

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# UI interface
pnpm test:ui

# Specific tests
pnpm test src/features/auth
```

## 📚 Resources

### Documentation

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

### Architecture

- [CLAUDE.md](./CLAUDE.md) - Detailed project guide
- [README.md](./README.md) - Overview
- [README.tests.md](./README.tests.md) - Testing guide

### Community

- [GitHub Discussions](https://github.com/haezclub/cms/discussions)
- [Discord](https://discord.gg/haezclub) (if available)

## ❓ Questions

If you have questions, feel free to:

1. Check the [documentation](./CLAUDE.md)
2. Search existing [issues](https://github.com/haezclub/cms/issues)
3. Create a [new issue](https://github.com/haezclub/cms/issues/new)
4. Ask in [GitHub Discussions](https://github.com/haezclub/cms/discussions)

---

Thank you for contributing! 🙏

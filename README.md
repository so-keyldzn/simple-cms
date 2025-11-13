<div align="center">
  <h1>Simple CMS</h1>
  <p>A modern, feature-rich Content Management System built with Next.js 15</p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
  [![Tests](https://img.shields.io/badge/tests-342%20passing-brightgreen)](./tests)

  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#contributing">Contributing</a>
  </p>

  <p>
    <a href="./README.md">🇬🇧 English</a> •
    <a href="./README.fr.md">🇫🇷 Français</a> •
    <a href="./README.es.md">🇪🇸 Español</a>
  </p>
</div>

---

## Overview

**Simple CMS** is a production-ready, self-hosted content management system designed for developers who want full control over their content platform. Built with modern technologies and best practices, it offers a powerful admin panel, flexible blog system, and comprehensive user management out of the box.

## Screenshots

<details>
<summary>Click to view screenshots</summary>

### Admin Dashboard
![Admin Dashboard](./docs/screenshots/dashboard.png)
*Overview of analytics, recent activity, and quick actions*

### Post Editor
![Post Editor](./docs/screenshots/post-editor.png)
*Rich text editor with Tiptap, supporting markdown, images, tables, and more*

### Media Library
![Media Library](./docs/screenshots/media-library.png)
*Organized media management with folder structure*

### User Management
![User Management](./docs/screenshots/user-management.png)
*Comprehensive user management with role-based access control*

### Comment Moderation
![Comment Moderation](./docs/screenshots/comments.png)
*Moderate comments with approve/reject workflow*

### Theme Customization
![Theme Customization](./docs/screenshots/appearance.png)
*Customize theme colors with OKLCH color picker*

</details>

> **Note:** Screenshots are placeholders. Create `docs/screenshots/` directory and add actual screenshots for production.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| **Authentication** | [Better Auth](https://better-auth.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (New York style) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (OKLCH color space) |
| **Rich Text** | [Tiptap](https://tiptap.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| **Package Manager** | [pnpm](https://pnpm.io/) |
| **Build Tool** | [Turbopack](https://turbo.build/) |

## ✨ Features

### 📝 Blog & Content Management
- ✅ **Rich Text Editor** - Tiptap editor with markdown, tables, images, YouTube embeds, syntax highlighting
- ✅ **Content Organization** - Posts with categories, tags, and custom slugs
- ✅ **Workflow Management** - Draft/published status with scheduled publishing
- ✅ **Media Integration** - Cover images with responsive optimization
- ✅ **Comment System** - Moderation workflow with threaded replies (3 levels deep)
- ✅ **SEO Friendly** - Meta tags, Open Graph, structured data

### 🛠️ Admin Panel
- ✅ **User Management** - Create, edit, ban users with role-based permissions
- ✅ **Post Management** - Full CRUD operations with bulk actions
- ✅ **Category & Tags** - Organize content with hierarchical taxonomy
- ✅ **Comment Moderation** - Approve, reject, or delete comments with anti-spam
- ✅ **Media Library** - Upload, organize files in folders with search
- ✅ **Theme Customization** - Live color picker with OKLCH color space
- ✅ **Analytics Dashboard** - Track users, posts, comments, and storage

### 🔐 Authentication & Security
- ✅ **Role-Based Access Control** - 6 role levels (super-admin → user)
- ✅ **Secure Sessions** - httpOnly cookies with 30-day duration
- ✅ **Email Verification** - Required for new accounts
- ✅ **Password Reset** - Secure token-based flow via email
- ✅ **User Impersonation** - Debug issues as another user (admin only)
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **XSS Protection** - Input sanitization and validation
- ✅ **Middleware Protection** - Edge-optimized route guards

### 🎨 User Experience
- ✅ **Dark/Light Mode** - System-aware theme switching
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Accessibility** - ARIA labels, keyboard navigation
- ✅ **Toast Notifications** - User feedback for all actions
- ✅ **Loading States** - Skeleton screens and spinners
- ✅ **Error Handling** - Graceful fallbacks and error boundaries

### 🧪 Testing & Quality
- ✅ **342 Unit Tests** - Comprehensive test coverage with Vitest
- ✅ **TypeScript** - Full type safety across the codebase
- ✅ **ESLint** - Code quality and consistency
- ✅ **Prettier** - Automatic code formatting

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **pnpm** 8.x or higher ([Install](https://pnpm.io/installation))

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/simple-cms.git
cd simple-cms
```

**2. Install dependencies**

```bash
pnpm install
```

**3. Set up environment variables**

Copy `.env.example` to `.env.local` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/simple_cms"

# Authentication
BETTER_AUTH_SECRET="your-secret-key-min-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auto-Seed First Admin (created automatically on first server startup)
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="SecurePassword123!"
SEED_ADMIN_NAME="Super Admin"

# Site Configuration
NEXT_PUBLIC_SITE_NAME="My CMS"
NEXT_PUBLIC_SITE_DESCRIPTION="A modern content management system"
NEXT_PUBLIC_SITE_LOGO=""
NEXT_PUBLIC_SITE_FAVICON=""

# Email (optional - for password reset)
EMAIL_FROM="noreply@yourdomain.com"
RESEND_API_KEY="re_xxxxx"

# Media Storage (optional - for uploads)
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="simple-cms-media"
NEXT_PUBLIC_MINIO_ENDPOINT="http://localhost:9000"
```

> **Tip:** Generate a secure secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**4. Set up the database**

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations (production)
npx prisma migrate deploy

# OR for development (interactive)
npx prisma migrate dev
```

**5. Run the development server**

```bash
pnpm dev
```

**6. First Admin Auto-Creation**

The first super-admin user is **automatically created** on server startup using the credentials from your `.env.local`:
- Email: `SEED_ADMIN_EMAIL`
- Password: `SEED_ADMIN_PASSWORD`
- Name: `SEED_ADMIN_NAME`

🎉 **You're all set!** Sign in at [http://localhost:3000/sign-in](http://localhost:3000/sign-in) and access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📚 Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guide for contributors
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[SECURITY.md](./SECURITY.md)** - Security policy and best practices
- **[CLAUDE.md](./CLAUDE.md)** - Project instructions for Claude Code

---

## 🛠️ Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests with Vitest |
| `pnpm test:ui` | Run tests with UI |
| `pnpm test:coverage` | Generate coverage report |

### Database

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Push schema changes (dev only) |
| `pnpm db:migrate` | Create and apply migrations |
| `pnpm db:migrate:deploy` | Apply migrations (production) |
| `pnpm db:studio` | Open Prisma Studio GUI |

---

## 📁 Project Structure

```
simple-cms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # 🔒 Admin routes (requires auth)
│   │   │   ├── admin/         # Dashboard, analytics
│   │   │   ├── posts/         # Post management
│   │   │   ├── categories/    # Category management
│   │   │   ├── tags/          # Tag management
│   │   │   ├── comments/      # Comment moderation
│   │   │   ├── media/         # Media library
│   │   │   ├── users/         # User management
│   │   │   ├── appearance/    # Theme customization
│   │   │   └── settings/      # General settings
│   │   ├── (auth)/            # 🔓 Authentication pages
│   │   │   ├── sign-in/       # Login page
│   │   │   ├── sign-up/       # Registration page
│   │   │   └── reset-password/ # Password reset
│   │   ├── (blog)/            # 📝 Public blog routes
│   │   │   └── blog/          # Post listing and detail
│   │   ├── (site)/            # 🌐 Public site routes
│   │   │   └── about/         # About page
│   │   └── api/               # API routes
│   │       └── auth/          # Better Auth endpoint
│   │
│   ├── features/              # Feature-based modules
│   │   ├── auth/             # Authentication & sessions
│   │   │   ├── components/   # Sign-in, sign-up forms
│   │   │   ├── lib/          # Better Auth config, actions
│   │   │   └── provider/     # Session provider
│   │   ├── admin/            # Admin functionality
│   │   │   ├── components/   # Admin UI components
│   │   │   └── lib/          # Server actions (users, media, settings)
│   │   ├── blog/             # Blog/CMS features
│   │   │   ├── components/   # Post editor, dialogs
│   │   │   └── lib/          # Server actions (posts, comments)
│   │   └── theme/            # Theme management
│   │       ├── components/   # Theme toggle
│   │       └── provider/     # Theme provider
│   │
│   ├── components/           # Shared UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── rich-text-editor.tsx # Tiptap editor
│   │   ├── color-picker.tsx     # OKLCH color picker
│   │   └── multi-select.tsx     # Tag selector
│   │
│   └── lib/                 # Shared utilities
│       ├── prisma.ts       # Centralized Prisma client (singleton)
│       ├── auto-seed.ts    # Auto-create first admin from env vars
│       ├── site-config.ts  # Site settings from env vars
│       ├── roles.ts        # Role definitions and permissions
│       ├── utils.ts        # Helper functions
│       └── metadata.ts     # SEO metadata
│
├── prisma/                  # Database schema
│   ├── schema.prisma       # Main schema (generator + datasource)
│   ├── users.prisma        # User, Session, Account models
│   ├── post.prisma         # Post, Category, Tag models
│   ├── comment.prisma      # Comment model
│   └── media.prisma        # Media, MediaFolder models
│
├── tests/                   # Test files
│   ├── features/           # Feature tests
│   └── components/         # Component tests
│
├── docs/                    # Documentation
│   └── screenshots/        # Screenshots for README
│
├── instrumentation.ts       # Next.js server startup (auto-seed admin)
├── CONTRIBUTING.md          # Contribution guide
├── DEPLOYMENT.md            # Deployment guide
├── SECURITY.md              # Security policy
└── CLAUDE.md                # Claude Code instructions
```

---

## 🔑 Key Architecture Decisions

### Feature-Based Structure
- **Modular design:** Each feature is self-contained with components, actions, and logic
- **Scalability:** Easy to add new features without affecting existing code
- **Maintainability:** Clear separation of concerns

### Centralized Prisma Client
- **Import from:** `@/lib/prisma` (NOT `@/generated/prisma`)
- **Singleton pattern:** Prevents multiple database connections
- **Custom output path:** `generated/prisma` for cleaner imports

### Server Actions Pattern
- **Location:** All actions in `features/*/lib/*-actions.ts`
- **Never in app routes:** Keeps pages thin and focused on rendering
- **Standardized responses:** `{ data, error }` pattern for consistency

### Multi-Schema Prisma
- **Organized by domain:** `users.prisma`, `post.prisma`, `comment.prisma`, `media.prisma`
- **Automatic merging:** Via `prisma.config.ts`
- **Better maintainability:** Easier to navigate and understand schema

### Role-Based Access Control
- **6 role levels:** super-admin, admin, editor, moderator, author, user
- **Granular permissions:** Feature-level access control
- **Middleware protection:** Edge-optimized route guards
- **Defined in:** `src/lib/roles.ts` and `src/lib/route-permissions.ts`

---

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) guide for details on:

- Code of conduct
- Development setup
- Code standards
- Pull request process
- Testing guidelines

**Quick contribution steps:**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with these amazing open-source projects:

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Better Auth](https://better-auth.com/) - Authentication library
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tiptap](https://tiptap.dev/) - Rich text editor
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vitest](https://vitest.dev/) - Testing framework

---

## 📞 Support

- **Documentation:** [CONTRIBUTING.md](./CONTRIBUTING.md) | [DEPLOYMENT.md](./DEPLOYMENT.md) | [SECURITY.md](./SECURITY.md)
- **Issues:** [GitHub Issues](https://github.com/yourusername/simple-cms/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/simple-cms/discussions)
- **Security:** See [SECURITY.md](./SECURITY.md) for reporting vulnerabilities

---

<div align="center">
  <p>Made with ❤️ by developers, for developers</p>
  <p>
    <a href="https://github.com/yourusername/simple-cms">⭐ Star on GitHub</a> •
    <a href="https://github.com/yourusername/simple-cms/issues">🐛 Report Bug</a> •
    <a href="https://github.com/yourusername/simple-cms/issues">✨ Request Feature</a>
  </p>
</div>




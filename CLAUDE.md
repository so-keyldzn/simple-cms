# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 CMS application using the App Router, built with TypeScript, Prisma ORM (PostgreSQL), Better Auth, and shadcn/ui components. The project uses pnpm as the package manager and Turbopack for development and builds.

## Common Commands

### Development
```bash
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production with Turbopack
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Prisma Database
```bash
npx prisma generate   # Generate Prisma Client (outputs to generated/prisma)
npx prisma migrate dev # Create and apply migrations (non-interactive environments not supported)
npx prisma studio     # Open Prisma Studio GUI
npx prisma db push    # Push schema changes without migrations
```

## Architecture

### Feature-Based Structure

The project follows a feature-based architecture where each major domain has its own folder in `src/features/`:

```
src/
├── features/
│   ├── auth/              # Authentication & session management
│   │   ├── components/    # Sign-in, sign-up, user dropdown
│   │   ├── lib/          # Better Auth configuration, client
│   │   └── provider/     # Session provider wrapper
│   │
│   ├── admin/            # Admin panel functionality
│   │   ├── components/   # Admin sidebar, user management dialogs
│   │   └── lib/         # Server Actions for admin (users, appearance)
│   │
│   ├── blog/            # Blog/CMS functionality
│   │   ├── components/  # Post dialogs (create, edit)
│   │   └── lib/        # Server Actions (posts, categories, tags)
│   │
│   └── theme/          # Theme management
│       ├── components/ # Theme toggle
│       └── provider/   # Theme provider
│
├── lib/
│   ├── prisma.ts      # Centralized Prisma Client (singleton pattern)
│   ├── roles.ts       # Role-based access control definitions
│   └── utils.ts       # Shared utilities
│
├── components/
│   └── ui/            # shadcn/ui components + custom (TiptapEditor, ColorPicker, MultiSelect)
│
└── app/
    ├── (admin)/       # Admin route group (with sidebar layout)
    ├── (auth)/        # Auth route group
    ├── (blog)/        # Public blog routes
    └── (site)/        # Public site routes
```

### Key Architectural Patterns

**1. Centralized Prisma Client**
- Import from `@/lib/prisma` (NOT from `@/generated/prisma`)
- Uses singleton pattern to prevent multiple instances
- Example:
```typescript
import { prisma } from "@/lib/prisma";
```

**2. Server Actions Location**
- All Server Actions are in `features/*/lib/*-actions.ts`
- Blog actions: `@/features/blog/lib/post-actions.ts`, `category-actions.ts`, `tag-actions.ts`
- Admin actions: `@/features/admin/lib/user-actions.ts`, `appearance-actions.ts`
- Never create `actions.ts` files directly in app routes

**3. Feature Components**
- Reusable components live in `features/*/components/`
- UI components (shadcn) live in `components/ui/`
- Pages in `app/` should be thin and import from features

**4. Route Groups**
- `(admin)` - Admin pages with sidebar layout, role-based access
- `(auth)` - Authentication pages (sign-in, sign-up)
- `(blog)` - Public blog pages
- `(site)` - Public site pages
- Route groups don't affect URL structure

### Authentication & Authorization

**Better Auth Setup:**
- Configuration: `src/features/auth/lib/auth.ts`
- Client: `src/features/auth/lib/auth-clients.ts`
- Admin plugin enabled with custom roles
- Session duration: 30 days
- API endpoint: `/api/auth/[...all]`

**Roles System:**
- Defined in `src/lib/roles.ts`
- Roles: `super-admin`, `admin`, `editor`, `moderator`, `author`, `user`
- Role-based permissions matrix for feature access
- Middleware checks roles for admin routes (`src/middleware.ts`)

**Important Auth Notes:**
- Server Actions use `await auth.api.getSession({ headers: await headers() })`
- Client-side uses `useSession()` hook from `@/features/auth/lib/auth-clients`
- Admin operations require user ID in `adminUserIds` array in auth config

### Prisma Configuration

**Multi-File Schema:**
- `prisma.config.ts` configures schema file merging
- `prisma/schema.prisma` - Generator and datasource only
- `prisma/users.prisma` - User model
- `prisma/post.prisma` - Post, Category, Tag, PostTag models
- One model per file pattern
- Client outputs to `generated/prisma` (custom path)

**Database Models:**
- User (Better Auth managed)
- Post (with slug, published status, category, tags)
- Category (with slug)
- Tag (with slug)
- PostTag (many-to-many relation)

### Styling & UI

**Tailwind CSS v4:**
- Uses CSS `@import` syntax (not tailwind.config.js)
- Theme defined in `src/app/globals.css` with CSS variables
- OKLCH color space for theme colors
- Dark mode via `next-themes`

**shadcn/ui:**
- Style: "new-york"
- Add components: `npx shadcn@latest add [component-name]`
- Custom components: TiptapEditor, ColorPicker, MultiSelect

**Custom Components:**
- **TiptapEditor**: Rich text editor with toolbar, MUST set `immediatelyRender: false` to avoid SSR issues
- **ColorPicker**: OKLCH color picker with sliders
- **MultiSelect**: Badge-based multi-select for tags

### Blog/CMS Features

**Content Management:**
- Posts with rich text editor (Tiptap)
- Categories and tags for organization
- Draft/published status
- Cover images (URL-based)
- Slug auto-generation from titles

**Admin Pages:**
- `/admin/posts` - List, create, edit, delete posts
- `/admin/posts/new` - Dedicated post creation page
- `/admin/posts/[id]/edit` - Dedicated post editing page
- `/admin/categories` - Manage categories
- `/admin/tags` - Manage tags
- `/admin/users` - User management (list, create, ban, role assignment, impersonation)
- `/admin/appearance` - Theme color customization

**Public Pages:**
- `/blog` - Blog post listing
- `/blog/[slug]` - Individual post view

### Important Path Aliases

```typescript
@/*           -> ./src/*
@/lib/prisma  -> Centralized Prisma client
@/features/*  -> Feature modules
```

### Environment Variables

Required in `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth secret key
- `BETTER_AUTH_URL` - Auth base URL (http://localhost:3000)
- `NEXT_PUBLIC_APP_URL` - Public app URL

### Common Patterns

**Server Actions Pattern:**
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";

export async function myAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { data: null, error: "Non autorisé" };
  }

  // Action logic...
  revalidatePath("/path");
  return { data: result, error: null };
}
```

**Middleware Edge Runtime:**
- Cannot use Prisma directly (Edge Runtime limitation)
- Use `betterFetch` for session checks instead
- See `src/middleware.ts` for reference

### Role-Based Menu Items

Admin sidebar filters menu items based on user roles. Check `src/features/admin/components/admin-sidebar.tsx` for the menu structure and role requirements.

## Important Reminders

- Always use centralized Prisma client from `@/lib/prisma`
- Place Server Actions in `features/*/lib/` (NOT in app routes)
- Use feature-based imports in pages
- Set `immediatelyRender: false` for Tiptap editor
- Ensure proper role checks in Server Actions
- Use `revalidatePath` after mutations
- Follow the existing feature structure when adding new functionality

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
- Blog actions: `@/features/blog/lib/post-actions.ts`, `category-actions.ts`, `tag-actions.ts`, `comment-actions.ts`
- Admin actions: `@/features/admin/lib/user-actions.ts`, `appearance-actions.ts`, `media-actions.ts`, `folder-actions.ts`, `setting-actions.ts`
- Auth actions: `@/features/auth/lib/profile-actions.ts`
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
- `prisma/users.prisma` - User, Session, Account, Verification models
- `prisma/post.prisma` - Post, Category, Tag, PostTag models
- `prisma/comment.prisma` - Comment model with CommentStatus enum
- `prisma/media.prisma` - Media, MediaFolder models
- One model per file pattern
- Client outputs to `generated/prisma` (custom path)

**Database Models:**
- **User** - Better Auth managed (id, name, email, emailVerified, image, role, banned, banReason, banExpires, createdAt, updatedAt)
- **Post** - Blog posts (id, title, slug, excerpt, content, coverImage, published, publishedAt, commentsEnabled, author, category, tags, comments)
- **Category** - Content categories (id, name, slug, description)
- **Tag** - Content tags (id, name, slug)
- **PostTag** - Many-to-many relation between posts and tags
- **Comment** - Threaded comments (id, content, status enum, authorName, authorEmail, post, parent, depth, ipAddress, userAgent, metadata)
- **Media** - File uploads (id, filename, url, mimeType, size, folder, uploadedBy)
- **MediaFolder** - Hierarchical folders (id, name, parent, createdBy)

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
- **RichTextEditor** (`rich-text-editor.tsx`): Full-featured Tiptap editor with toolbar
  - Extensions: StarterKit, Link, Image, Table, Task List, YouTube, Highlight, Color, Typography
  - Custom extensions: ImagePlaceholder, SearchAndReplace
  - MUST set `immediatelyRender: false` to avoid SSR issues
  - Includes bubble menu for inline formatting
- **ColorPicker**: OKLCH color picker with sliders for theme customization
- **MultiSelect**: Badge-based multi-select for tags
- **ComboboxCreatable**: Searchable dropdown with create-new option

### Blog/CMS Features

**Content Management:**
- Posts with rich text editor (Tiptap)
- Categories and tags for organization
- Draft/published status
- Cover images (URL-based)
- Slug auto-generation from titles
- Comments system with moderation (PENDING/APPROVED/REJECTED)
- Comment threading (replies up to 3 levels deep)
- Enable/disable comments per post

**Admin Pages:**
- `/admin/posts` - List, create, edit, delete posts
- `/admin/posts/new` - Dedicated post creation page
- `/admin/posts/[id]/edit` - Dedicated post editing page
- `/admin/categories` - Manage categories
- `/admin/tags` - Manage tags
- `/admin/comments` - Moderate comments (approve, reject, delete)
- `/admin/media` - Media library with folder organization
- `/admin/users` - User management (list, create, ban, role assignment, impersonation)
- `/admin/appearance` - Theme color customization
- `/admin/settings` - General CMS settings
- `/dashboard` - Admin dashboard (accessible to all authenticated roles)

**Public Pages:**
- `/blog` - Blog post listing
- `/blog/[slug]` - Individual post view with comments section

### Comments System

**Architecture:**
- Comments stored with moderation status: `PENDING`, `APPROVED`, `REJECTED`
- Support for threaded replies (max 3 levels deep)
- Anti-spam measures: rate limiting (5 comments/min), XSS sanitization, IP/UserAgent tracking
- Per-post toggle to enable/disable new comments

**Server Actions:**
- `createCommentAction()` - Create comment (public, requires auth)
- `listPostCommentsAction()` - List approved comments (public, hierarchical structure)
- `listAllCommentsAction()` - List all comments with filters (admin only)
- `updateCommentStatusAction()` - Approve/reject comment (moderator+)
- `deleteCommentAction()` - Delete comment and replies (moderator+)
- `getCommentsStatsAction()` - Get moderation statistics (moderator+)

**Components:**
- `comment-form.tsx` - Comment creation form with validation
- `comment-item.tsx` - Individual comment display with threading
- `comment-section.tsx` - Complete section (form + list), handles disabled state

**Important Notes:**
- Comments default to `PENDING` status for moderation
- Optimized query: single fetch with manual hierarchy construction (no N+1)
- When `commentsEnabled = false`, existing comments still display (read-only)
- Permissions via `canManageComments` in roles system

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

**Route Permissions:**
- Route-level access control defined in `src/lib/route-permissions.ts`
- Maps admin routes to required permissions (e.g., `/admin/users` → `canManageUsers`)
- Checked by middleware before page access
- Supports OR logic (user needs at least one of the required permissions)

### Role-Based Menu Items

Admin sidebar filters menu items based on user roles. Check `src/features/admin/components/admin-sidebar.tsx` for the menu structure and role requirements.

### Media Management

**Architecture:**
- MinIO integration for object storage (configured in next.config.ts)
- Folder-based organization with hierarchical structure
- Upload tracking (filename, URL, MIME type, size, uploader)
- Remote image patterns configured for localhost:9000 and all HTTPS domains

**Server Actions:**
- `createMediaAction()` - Upload new media file
- `listMediaAction()` - List media with folder filtering
- `deleteMediaAction()` - Delete media file
- `createFolderAction()` - Create media folder
- `updateFolderAction()` - Rename folder
- `deleteFolderAction()` - Delete folder and contents

**Components:**
- `media-grid.tsx` - Display grid of media items
- `media-upload-dialog.tsx` - Upload interface
- `folder-tree.tsx` - Hierarchical folder navigation
- `folder-breadcrumb.tsx` - Current path display
- `folder-create-dialog.tsx` / `folder-edit-dialog.tsx` - Folder management

## Important Reminders

- Always use centralized Prisma client from `@/lib/prisma`
- Place Server Actions in `features/*/lib/` (NOT in app routes)
- Use feature-based imports in pages
- Set `immediatelyRender: false` for Tiptap editor
- Ensure proper role checks in Server Actions
- Use `revalidatePath` after mutations
- Follow the existing feature structure when adding new functionality
- Comments require moderation - check `status` field (PENDING/APPROVED/REJECTED)
- Respect `commentsEnabled` flag on posts
- Media uploads should be organized into folders
- Always validate user permissions via roles/permissions system

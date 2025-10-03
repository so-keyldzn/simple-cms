# CMS Application

A modern, feature-rich Content Management System built with Next.js 15, featuring a powerful admin panel, blog functionality, and comprehensive user management.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **UI Components**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS v4 (OKLCH color space)
- **Rich Text Editor**: Tiptap
- **Package Manager**: pnpm
- **Build Tool**: Turbopack

## Features

### Blog & Content Management
- Rich text editor with Tiptap
- Posts with categories and tags
- Draft/published workflow
- Cover images and slug management
- Comments system with moderation
- Threaded replies (up to 3 levels)
- Per-post comment toggle

### Admin Panel
- User management (roles, permissions, impersonation)
- Post management (create, edit, delete)
- Category and tag organization
- Comment moderation (approve/reject/delete)
- Media library with folder organization
- Theme customization (appearance settings)

### Authentication & Authorization
- Role-based access control (super-admin, admin, editor, moderator, author, user)
- Session management (30-day duration)
- User impersonation for admins
- Secure middleware protection

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables in `.env.local`:
```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Available Scripts

### Development
```bash
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Database
```bash
npx prisma generate   # Generate Prisma Client
npx prisma db push    # Push schema changes
npx prisma studio     # Open Prisma Studio GUI
```

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (admin)/         # Admin pages
│   ├── (auth)/          # Authentication pages
│   ├── (blog)/          # Public blog pages
│   └── (site)/          # Public site pages
├── features/            # Feature-based modules
│   ├── auth/           # Authentication & sessions
│   ├── admin/          # Admin functionality
│   ├── blog/           # Blog/CMS features
│   └── theme/          # Theme management
├── components/         # Shared UI components
│   └── ui/            # shadcn/ui components
└── lib/               # Shared utilities
    ├── prisma.ts      # Centralized Prisma client
    └── roles.ts       # Role definitions
```

## Key Features

### Multi-Schema Prisma
- Organized schema files by domain (users, posts, media, comments)
- Automatic schema merging via `prisma.config.ts`
- Custom output path: `generated/prisma`

### Role-Based Access Control
- Granular permissions matrix
- Middleware-protected routes
- Feature-level access control

### Comments System
- Moderation workflow (pending → approved/rejected)
- Anti-spam measures (rate limiting, XSS sanitization)
- IP and UserAgent tracking
- Hierarchical threading

### Media Management
- Folder organization
- Upload tracking
- Integration with blog posts




# Deployment Guide

This guide covers deploying **Simple CMS** to production environments.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Deployment Platforms](#deployment-platforms)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Docker](#docker)
  - [VPS/Self-Hosted](#vpsself-hosted)
- [Media Storage](#media-storage)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

**Checklist before deployment:**

1. ✅ Database (PostgreSQL) is provisioned and accessible
2. ✅ All environment variables are configured
3. ✅ Media storage (MinIO/S3) is set up
4. ✅ Domain name is configured (optional but recommended)
5. ✅ SSL certificate is configured (automatic with Vercel/most platforms)
6. ✅ Database migrations are applied
7. ✅ Build passes locally (`pnpm build`)

---

## Environment Variables

### Required Variables

Create a `.env.production` file or configure these in your hosting platform:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="https://yourdomain.com"

# Public App URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Email (optional but recommended)
EMAIL_FROM="noreply@yourdomain.com"
RESEND_API_KEY="re_..."

# MinIO/S3 (optional - for media uploads)
MINIO_ENDPOINT="s3.yourdomain.com"
MINIO_PORT="443"
MINIO_USE_SSL="true"
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
MINIO_BUCKET_NAME="simple-cms-media"
NEXT_PUBLIC_MINIO_ENDPOINT="https://s3.yourdomain.com"
```

### Generate Secrets

```bash
# Generate BETTER_AUTH_SECRET (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

### Database URL Format

```bash
# Standard PostgreSQL
DATABASE_URL="postgresql://username:password@host:port/database"

# With SSL (recommended for production)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Supabase example
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require"

# Neon example
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## Database Setup

### 1. Provision Database

**Recommended providers:**
- [Supabase](https://supabase.com) - Free tier available, great integration
- [Neon](https://neon.tech) - Serverless PostgreSQL, generous free tier
- [Railway](https://railway.app) - Simple setup, pay-as-you-go
- [Render](https://render.com) - Free PostgreSQL tier
- Self-hosted PostgreSQL

### 2. Apply Migrations

**Option A: Prisma Migrate (Recommended)**

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations to production database
npx prisma migrate deploy
```

**Option B: Prisma DB Push (Quick setup, not recommended for production)**

```bash
npx prisma db push
```

### 3. Verify Schema

```bash
# Open Prisma Studio to verify
npx prisma studio
```

### 4. Seed Data (Optional)

If you have seed data:

```bash
npx prisma db seed
```

---

## Deployment Platforms

### Vercel (Recommended)

Vercel is the easiest platform for deploying Next.js applications.

#### Prerequisites

- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)

#### Steps

1. **Push code to Git repository**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/simple-cms.git
git push -u origin main
```

2. **Import project to Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your Git repository
- Select "simple-cms" project

3. **Configure Build Settings**

Vercel auto-detects Next.js. Verify settings:

- **Framework Preset:** Next.js
- **Build Command:** `pnpm build`
- **Output Directory:** `.next`
- **Install Command:** `pnpm install`
- **Node Version:** 18.x or higher

4. **Add Environment Variables**

In Vercel dashboard → Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
EMAIL_FROM=noreply@yourdomain.com
RESEND_API_KEY=re_...
# ... add all other variables
```

5. **Deploy**

- Click "Deploy"
- Wait for build to complete (~2-5 minutes)
- Visit your deployment URL

6. **Custom Domain (Optional)**

- Go to Settings → Domains
- Add your custom domain
- Configure DNS records as instructed
- SSL certificate is automatic

#### Vercel-Specific Notes

- **Serverless Functions:** Each API route becomes a serverless function
- **Edge Middleware:** Runs on edge network for fast authentication checks
- **Image Optimization:** Automatic via Next.js Image component
- **Caching:** Configure in `next.config.ts` or with headers

---

### Docker

Deploy Simple CMS using Docker containers.

#### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run migrations and start app
CMD npx prisma migrate deploy && pnpm start
```

#### docker-compose.yml

For local testing with PostgreSQL and MinIO:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: simple_cms
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  minio:
    image: minio/minio
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/simple_cms"
      BETTER_AUTH_SECRET: "your-secret-key-change-this"
      BETTER_AUTH_URL: "http://localhost:3000"
      NEXT_PUBLIC_APP_URL: "http://localhost:3000"
      MINIO_ENDPOINT: "minio"
      MINIO_PORT: "9000"
      MINIO_USE_SSL: "false"
      MINIO_ACCESS_KEY: "minioadmin"
      MINIO_SECRET_KEY: "minioadmin"
      MINIO_BUCKET_NAME: "simple-cms-media"
      NEXT_PUBLIC_MINIO_ENDPOINT: "http://localhost:9000"
    depends_on:
      - db
      - minio

volumes:
  postgres_data:
  minio_data:
```

#### Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

---

### VPS/Self-Hosted

Deploy to a Virtual Private Server (Ubuntu/Debian).

#### Prerequisites

- Ubuntu 22.04 LTS or Debian 11+ server
- Root or sudo access
- Domain name pointing to server IP

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE simple_cms;
CREATE USER simple_cms_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE simple_cms TO simple_cms_user;
\q
```

#### 3. Clone and Setup Project

```bash
# Create app directory
sudo mkdir -p /var/www/simple-cms
sudo chown $USER:$USER /var/www/simple-cms

# Clone repository
cd /var/www/simple-cms
git clone https://github.com/yourusername/simple-cms.git .

# Install dependencies
pnpm install --frozen-lockfile

# Create .env.production
nano .env.production
```

Add your environment variables:

```bash
DATABASE_URL="postgresql://simple_cms_user:secure_password_here@localhost:5432/simple_cms"
BETTER_AUTH_SECRET="your-generated-secret"
BETTER_AUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
# ... rest of variables
```

#### 4. Build Application

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Build Next.js app
pnpm build
```

#### 5. Setup PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add configuration:

```javascript
module.exports = {
  apps: [{
    name: 'simple-cms',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/simple-cms',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Start application:

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 6. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/simple-cms
```

Add configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/simple-cms /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 7. Setup SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### 8. Deploy Updates

```bash
# Pull latest changes
cd /var/www/simple-cms
git pull origin main

# Install dependencies (if package.json changed)
pnpm install

# Apply migrations (if schema changed)
npx prisma migrate deploy

# Rebuild application
pnpm build

# Restart PM2
pm2 restart simple-cms
```

---

## Media Storage

### Option 1: MinIO (Self-Hosted S3)

**Docker deployment:**

```bash
# Create MinIO container
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=your-secure-password \
  -v minio_data:/data \
  minio/minio server /data --console-address ":9001"

# Access MinIO Console at http://localhost:9001
```

**Create bucket:**

1. Login to MinIO Console
2. Create bucket named `simple-cms-media`
3. Set bucket policy to public-read for uploaded files
4. Generate access keys for application

**Environment variables:**

```bash
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"  # Set to "true" in production with SSL
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
MINIO_BUCKET_NAME="simple-cms-media"
NEXT_PUBLIC_MINIO_ENDPOINT="http://localhost:9000"  # Use https:// in production
```

### Option 2: AWS S3

1. Create S3 bucket in AWS Console
2. Configure bucket policy for public read access
3. Create IAM user with S3 access
4. Generate access keys

**Environment variables:**

```bash
MINIO_ENDPOINT="s3.amazonaws.com"
MINIO_PORT="443"
MINIO_USE_SSL="true"
MINIO_ACCESS_KEY="AWS_ACCESS_KEY_ID"
MINIO_SECRET_KEY="AWS_SECRET_ACCESS_KEY"
MINIO_BUCKET_NAME="your-bucket-name"
NEXT_PUBLIC_MINIO_ENDPOINT="https://your-bucket-name.s3.amazonaws.com"
```

### Option 3: Cloudflare R2

1. Create R2 bucket in Cloudflare dashboard
2. Generate API tokens
3. Configure custom domain (optional)

**Environment variables:**

```bash
MINIO_ENDPOINT="<account-id>.r2.cloudflarestorage.com"
MINIO_PORT="443"
MINIO_USE_SSL="true"
MINIO_ACCESS_KEY="R2_ACCESS_KEY_ID"
MINIO_SECRET_KEY="R2_SECRET_ACCESS_KEY"
MINIO_BUCKET_NAME="simple-cms-media"
NEXT_PUBLIC_MINIO_ENDPOINT="https://your-custom-domain.com"
```

---

## Post-Deployment

### 1. Complete Onboarding

Visit `https://yourdomain.com/onboard` to:

1. Create the first super admin user
2. Configure site settings (name, description, logo, favicon)

### 2. Verify Functionality

**Checklist:**

- ✅ Can sign in with super admin account
- ✅ Dashboard loads without errors
- ✅ Can create a blog post
- ✅ Can upload media files
- ✅ Can create additional users
- ✅ Public blog pages render correctly
- ✅ Email notifications work (if configured)
- ✅ Theme switching works
- ✅ Comments can be posted and moderated

### 3. Security Checklist

- ✅ Change all default passwords
- ✅ HTTPS is enabled (SSL certificate valid)
- ✅ Environment variables are secure (no hardcoded secrets)
- ✅ Database has strong password and restricted access
- ✅ Media storage has proper access controls
- ✅ Rate limiting is working (test by spamming login)
- ✅ CORS is properly configured
- ✅ CSP headers are set (if applicable)

### 4. Performance Optimization

**Enable caching:**

In `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // ... existing config

  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Add cache headers
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

**Database connection pooling:**

Update `DATABASE_URL`:

```bash
# Add connection pool parameters
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10"
```

**Enable production logging:**

Consider adding structured logging (e.g., Pino, Winston).

---

## Monitoring

### Application Monitoring

**Recommended services:**

- [Vercel Analytics](https://vercel.com/analytics) - Built-in for Vercel deployments
- [Sentry](https://sentry.io) - Error tracking and performance monitoring
- [LogRocket](https://logrocket.com) - Session replay and logging
- [Datadog](https://www.datadoghq.com) - Full-stack monitoring

**Setup Sentry (Example):**

```bash
pnpm add @sentry/nextjs
```

Run setup:

```bash
npx @sentry/wizard@latest -i nextjs
```

### Database Monitoring

- **Prisma Metrics:** Use Prisma's built-in metrics
- **Database Dashboard:** Use provider's dashboard (Supabase, Neon, etc.)
- **pgAdmin:** Self-hosted PostgreSQL management

### Uptime Monitoring

**Free services:**

- [UptimeRobot](https://uptimerobot.com)
- [Better Uptime](https://betteruptime.com)
- [Cronitor](https://cronitor.io)

Create monitors for:
- Homepage (`https://yourdomain.com`)
- API health (`https://yourdomain.com/api/health`)
- Admin panel (`https://yourdomain.com/admin`)

---

## Troubleshooting

### Build Failures

**Error: "Cannot find module '@/lib/prisma'"**

```bash
# Regenerate Prisma Client
npx prisma generate
```

**Error: "Type error: Cannot find module or its corresponding type declarations"**

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

### Database Connection Issues

**Error: "Can't reach database server"**

Check:
1. DATABASE_URL is correct
2. Database server is running
3. Firewall allows connection
4. SSL mode is correct (`sslmode=require` for hosted databases)

**Test connection:**

```bash
npx prisma db pull
```

### Authentication Issues

**Error: "BETTER_AUTH_SECRET is not set"**

Ensure environment variable is set:

```bash
echo $BETTER_AUTH_SECRET
```

**Error: "Invalid session"**

- Clear cookies in browser
- Check BETTER_AUTH_URL matches deployment URL
- Verify database session table is accessible

### Media Upload Issues

**Error: "Failed to upload media"**

Check:
1. MinIO/S3 credentials are correct
2. Bucket exists and is accessible
3. Bucket policy allows uploads
4. Network can reach storage endpoint

**Test MinIO connection:**

```bash
# Install MinIO client
brew install minio/stable/mc  # macOS
# or
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc

# Configure
mc alias set myminio http://localhost:9000 ACCESS_KEY SECRET_KEY

# List buckets
mc ls myminio
```

### Performance Issues

**Slow page loads:**

1. Enable Next.js production mode (`NODE_ENV=production`)
2. Check database query performance (use Prisma query logs)
3. Enable caching headers
4. Use CDN for static assets
5. Optimize images (use Next.js Image component)

**Database timeout errors:**

1. Increase connection pool size
2. Add database indexes for frequently queried fields
3. Use database connection pooler (PgBouncer)

### Migration Issues

**Error: "Migration failed to apply"**

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually apply migrations
npx prisma migrate resolve --applied <migration-name>
```

---

## Support

If you encounter issues:

1. Check [GitHub Issues](https://github.com/yourusername/simple-cms/issues)
2. Review [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup
3. Review [SECURITY.md](./SECURITY.md) for security-related questions
4. Create a new issue with deployment logs and environment details

---

**Deployment checklist complete? Start creating content with Simple CMS! 🚀**

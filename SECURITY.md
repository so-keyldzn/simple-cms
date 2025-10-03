# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please send an email to **security@yourdomain.com** (or create a private security advisory on GitHub).

### What to Include

Please include the following information:

- **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
- **Full paths of affected source files**
- **Location of the affected code** (tag/branch/commit or direct URL)
- **Step-by-step instructions to reproduce the issue**
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the vulnerability** (what an attacker could do)

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 7 days
- **Fix timeline:** Depends on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next scheduled release

### Disclosure Policy

- Security vulnerabilities will be disclosed publicly after a fix is released
- We will credit reporters in release notes (unless anonymity is requested)
- We follow responsible disclosure practices

---

## Security Best Practices

### For Administrators

1. **Strong Passwords**
   - Minimum 8 characters with uppercase, lowercase, and numbers
   - Use a password manager
   - Enable 2FA when available (future feature)

2. **User Management**
   - Regularly audit user accounts
   - Remove inactive users
   - Follow principle of least privilege (assign minimal required roles)
   - Monitor failed login attempts

3. **Environment Variables**
   - Never commit `.env` files to version control
   - Use secure secrets (32+ character random strings)
   - Rotate secrets periodically (every 90 days recommended)
   - Use different secrets for development and production

4. **Database Security**
   - Use SSL/TLS for database connections (`sslmode=require`)
   - Restrict database access to application IP only
   - Use strong database passwords
   - Regularly backup database
   - Keep PostgreSQL version up to date

5. **Media Storage**
   - Configure proper bucket policies (restrict write access)
   - Enable versioning for accidental deletions
   - Scan uploaded files for malware (recommended)
   - Restrict file types and sizes

6. **Updates**
   - Keep dependencies up to date (`pnpm update`)
   - Monitor security advisories (GitHub Dependabot)
   - Apply security patches promptly

### For Developers

1. **Input Validation**
   - All user inputs are validated with Zod schemas
   - Never trust client-side data
   - Sanitize inputs before database operations

2. **XSS Prevention**
   - All inputs are sanitized using `sanitizeInput` utility
   - React automatically escapes JSX content
   - Use `dangerouslySetInnerHTML` only when absolutely necessary (currently not used)

3. **SQL Injection Prevention**
   - Always use Prisma's parameterized queries
   - Never concatenate user input into raw SQL
   - Validate IDs before database queries

4. **Authentication**
   - Sessions are managed by Better Auth
   - Passwords are hashed with bcrypt (via Better Auth)
   - Session tokens are httpOnly cookies
   - CSRF protection is enabled

5. **Authorization**
   - All admin routes are protected by middleware
   - Server Actions verify user permissions
   - Role-based access control (RBAC) is enforced
   - Never rely on client-side authorization checks alone

6. **Rate Limiting**
   - Onboarding: 5 attempts per hour per IP
   - Login: Built-in Better Auth rate limiting
   - API routes: Should implement rate limiting for public endpoints

7. **Error Handling**
   - Never expose sensitive information in error messages
   - Log errors server-side only
   - Return generic error messages to clients

---

## Security Features

### Current Security Measures

#### Authentication (Better Auth)

- **Password Hashing:** bcrypt with salt
- **Session Management:** Secure httpOnly cookies
- **Email Verification:** Required for new accounts
- **Password Reset:** Secure token-based flow
- **Account Lockout:** After multiple failed login attempts

#### Authorization

- **Role-Based Access Control (RBAC):**
  - super-admin: Full system access
  - admin: User and content management
  - editor: Content creation and editing
  - moderator: Comment and content moderation
  - author: Own content creation
  - user: Basic authenticated access

- **Middleware Protection:**
  - All `/admin/*` routes require authentication
  - Routes check specific permissions via `route-permissions.ts`
  - Edge runtime for fast authorization checks

#### Input Validation

- **Zod Schemas:** All forms validated with Zod
- **Sanitization:** XSS protection via `sanitizeInput` utility
- **Email Validation:** Blocks temporary email domains
- **Password Requirements:**
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

#### Rate Limiting

- **Onboarding:** 5 attempts/hour per IP (in-memory)
- **Login:** Better Auth built-in rate limiting
- **Comment Creation:** 5 comments/minute per user

#### Content Security

- **Comment Moderation:**
  - All comments default to PENDING status
  - Moderator approval required
  - IP and User-Agent tracking
  - Threaded reply depth limit (3 levels)

- **Post Security:**
  - Authors can only edit their own posts (unless admin)
  - Draft/published status control
  - Slug validation to prevent path traversal

#### Database Security

- **Prisma ORM:** Parameterized queries prevent SQL injection
- **Connection Pooling:** Prevents connection exhaustion
- **SSL Connections:** Enforced in production

#### Media Security

- **Upload Restrictions:**
  - File type validation (MIME type checking)
  - File size limits enforced
  - Organized folder structure

- **Storage Access:**
  - Separate credentials for read/write
  - Public read, authenticated write
  - CORS configured for trusted domains

#### Headers

Next.js automatically sets security headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `X-DNS-Prefetch-Control: on`

### Planned Security Enhancements

- [ ] Two-Factor Authentication (2FA)
- [ ] Advanced rate limiting with Redis
- [ ] IP-based access restrictions
- [ ] Audit logging for admin actions
- [ ] Content Security Policy (CSP) headers
- [ ] Automated vulnerability scanning (Snyk, Dependabot)
- [ ] File upload malware scanning
- [ ] Advanced CAPTCHA for public forms
- [ ] Session timeout configuration
- [ ] Webhook signature verification

---

## Known Limitations

### Current Security Considerations

1. **Rate Limiting:**
   - Currently in-memory (resets on server restart)
   - Not distributed (won't work across multiple instances)
   - **Recommendation:** Use Redis for production

2. **File Uploads:**
   - MIME type validation is client-side verifiable
   - No malware scanning on uploaded files
   - **Recommendation:** Integrate ClamAV or similar

3. **Email Validation:**
   - Blocks known temporary email domains
   - List is not exhaustive
   - **Recommendation:** Use a service like ZeroBounce

4. **Session Management:**
   - Sessions last 30 days by default
   - No configurable timeout
   - **Recommendation:** Add session timeout settings

5. **Audit Logging:**
   - No centralized audit log for admin actions
   - **Recommendation:** Add audit trail for critical operations

6. **IP-Based Access:**
   - No IP whitelist/blacklist functionality
   - **Recommendation:** Add IP-based restrictions for admin panel

---

## Security Headers

### Recommended Next.js Configuration

Add to `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Content Security Policy (CSP)

For enhanced security, consider adding CSP headers:

```typescript
{
  key: 'Content-Security-Policy',
  value: `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self';
    frame-ancestors 'self';
  `.replace(/\s{2,}/g, ' ').trim()
}
```

**Note:** CSP requires careful configuration to avoid breaking functionality.

---

## Secure Deployment Checklist

Before deploying to production:

### Environment

- [ ] All environment variables are set correctly
- [ ] `.env` files are NOT committed to version control
- [ ] Secrets are rotated from development defaults
- [ ] `NODE_ENV=production` is set

### Database

- [ ] Database password is strong (20+ characters)
- [ ] SSL/TLS is enabled for database connections
- [ ] Database access is restricted to application IP
- [ ] Regular backups are configured
- [ ] Database version is up to date

### Authentication

- [ ] `BETTER_AUTH_SECRET` is a secure random string (32+ chars)
- [ ] `BETTER_AUTH_URL` matches production domain
- [ ] Email verification is enabled
- [ ] First admin account is created via onboarding (not hardcoded)

### Application

- [ ] HTTPS is enforced (SSL certificate installed)
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] Error messages don't expose sensitive information
- [ ] Logging is configured (without sensitive data)

### Media Storage

- [ ] MinIO/S3 credentials are secure
- [ ] Bucket policies are configured correctly
- [ ] Public access is restricted to read-only
- [ ] File size limits are enforced

### Monitoring

- [ ] Error tracking is set up (e.g., Sentry)
- [ ] Uptime monitoring is configured
- [ ] Security alerts are enabled
- [ ] Logs are reviewed regularly

---

## Incident Response Plan

If a security incident occurs:

### 1. Immediate Actions

1. **Assess the situation:**
   - What data was compromised?
   - What systems are affected?
   - Is the attacker still active?

2. **Contain the breach:**
   - Disable affected accounts
   - Block malicious IP addresses
   - Take affected systems offline if necessary

3. **Preserve evidence:**
   - Save server logs
   - Take database snapshots
   - Document timeline of events

### 2. Investigation

1. **Identify the vulnerability:**
   - Review access logs
   - Check for unauthorized database queries
   - Analyze file changes

2. **Determine scope:**
   - How many users are affected?
   - What data was accessed/modified?
   - How long has the breach been active?

### 3. Remediation

1. **Fix the vulnerability:**
   - Apply security patches
   - Update dependencies
   - Strengthen access controls

2. **Reset compromised credentials:**
   - Rotate all secrets and API keys
   - Force password resets for affected users
   - Regenerate session tokens

### 4. Communication

1. **Internal notification:**
   - Inform administrators immediately
   - Brief development team on findings

2. **User notification:**
   - Notify affected users within 72 hours (GDPR requirement)
   - Provide clear instructions on protective measures
   - Offer support resources

3. **Public disclosure:**
   - Publish security advisory after fix is deployed
   - Credit security researcher (if applicable)
   - Document lessons learned

### 5. Post-Incident Review

1. **Conduct post-mortem:**
   - What went wrong?
   - How can we prevent this in the future?
   - What processes need improvement?

2. **Update security measures:**
   - Implement additional safeguards
   - Update security documentation
   - Train team on new procedures

---

## Security Tools

### Recommended Development Tools

1. **Dependency Scanning:**
   ```bash
   # Check for known vulnerabilities
   pnpm audit

   # Fix vulnerabilities automatically
   pnpm audit --fix
   ```

2. **Static Analysis:**
   ```bash
   # ESLint security rules
   pnpm add -D eslint-plugin-security
   ```

3. **Git Secrets:**
   ```bash
   # Prevent committing secrets
   brew install git-secrets
   git secrets --install
   git secrets --register-aws
   ```

4. **Pre-commit Hooks:**
   ```bash
   # Install Husky
   pnpm add -D husky
   pnpm exec husky init

   # Add pre-commit hook
   echo "pnpm lint && pnpm test" > .husky/pre-commit
   ```

### Production Monitoring Tools

- **Sentry:** Error tracking and performance monitoring
- **Snyk:** Continuous security scanning
- **Dependabot:** Automated dependency updates
- **OWASP ZAP:** Web application security scanner
- **Fail2Ban:** Intrusion prevention (for VPS deployments)

---

## Compliance

### GDPR Considerations

Simple CMS stores personal data:

- User email addresses
- User names
- Comment author information (name, email, IP address)

**Your responsibilities:**

1. **Data Processing Agreement:** Ensure you have legal basis to process data
2. **Privacy Policy:** Publish a clear privacy policy
3. **Data Retention:** Define retention periods for user data
4. **Right to Erasure:** Implement user data deletion (delete user account)
5. **Data Portability:** Allow users to export their data
6. **Consent:** Obtain consent for data collection (e.g., comment forms)

**Recommended additions:**

- Cookie consent banner (if using analytics)
- Privacy policy page
- Terms of service page
- Data export functionality
- GDPR-compliant data deletion

### Other Regulations

Depending on your jurisdiction and use case:

- **CCPA (California):** Similar to GDPR for California residents
- **COPPA (USA):** If targeting children under 13
- **PIPEDA (Canada):** Privacy requirements in Canada
- **DPA (UK):** UK data protection requirements

**Recommendation:** Consult with legal counsel for compliance requirements.

---

## Security Resources

### Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Better Auth Documentation](https://better-auth.com/docs)

### Security News

- [Snyk Vulnerability Database](https://snyk.io/vuln/)
- [CVE Details](https://www.cvedetails.com/)
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [GitHub Security Advisories](https://github.com/advisories)

---

## Contact

For security-related questions or to report vulnerabilities:

- **Email:** security@yourdomain.com
- **GitHub Security Advisories:** [Create Private Advisory](https://github.com/yourusername/simple-cms/security/advisories/new)

For general support:
- **Issues:** https://github.com/yourusername/simple-cms/issues
- **Discussions:** https://github.com/yourusername/simple-cms/discussions

---

**Thank you for helping keep Simple CMS secure! 🔒**

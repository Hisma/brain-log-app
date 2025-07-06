---
title: Environment Configuration
description: Comprehensive guide to environment variable management across development and production environments
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Environment Configuration

## Overview

The Brain Log App uses a sophisticated environment configuration system that supports multiple deployment scenarios while maintaining security and flexibility. This document covers environment variable management, the split deployment strategy, and security best practices.

## Environment File Structure

### Split Environment Strategy

The application uses different environment files for different deployment contexts:

```
project-root/
├── .env                     # Local development (committed as template)
├── .env.local              # Local development overrides (git-ignored)
├── .env.production.local   # Production overrides (git-ignored)
├── .env.example           # Template with placeholder values (committed)
└── .gitignore             # Excludes sensitive env files
```

### File Priority Order

Next.js loads environment files in this order (later files override earlier ones):

1. `.env` (lowest priority)
2. `.env.local`
3. `.env.production` (production only)
4. `.env.production.local` (highest priority, production only)

### Development vs Production

**Development (.env.local):**
- Contains actual development values
- Uses local database connections
- Includes development API keys
- Git-ignored for security

**Production (.env.production.local):**
- Contains actual production values
- Uses production database URLs
- Includes production API keys
- Git-ignored for security
- Only loaded in production environment

## Required Environment Variables

### Database Configuration

```env
# Database connection string
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Example development value (in .env.local):
# DATABASE_URL="postgresql://dev_user:dev_pass@localhost:5432/brain_log_dev"

# Example production value (in .env.production.local):
# DATABASE_URL="postgresql://prod_user:secure_pass@prod-host:5432/brain_log_prod?sslmode=require"
```

### Authentication Configuration

```env
# NextAuth.js configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-32-character-minimum-secret-key"

# Development examples:
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="development-secret-key-min-32-chars"

# Production examples:
# NEXTAUTH_URL="https://brain-log-app.vercel.app"
# NEXTAUTH_SECRET="production-secure-random-32-char-minimum-secret"
```

### OpenAI Integration

```env
# OpenAI API configuration
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-3.5-turbo"

# Development example:
# OPENAI_API_KEY="sk-dev-key-for-testing"

# Production example:
# OPENAI_API_KEY="sk-prod-key-with-rate-limits"
```

### Email Service (Optional)

```env
# Email service configuration
EMAIL_SERVER_HOST="smtp.your-provider.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email-username"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@your-domain.com"

# Development example (using test service):
# EMAIL_SERVER_HOST="smtp.mailtrap.io"
# EMAIL_FROM="test@example.com"

# Production example:
# EMAIL_SERVER_HOST="smtp.resend.com"
# EMAIL_FROM="noreply@yourdomain.com"
```

## Environment File Templates

### .env (Committed Template)

This file contains non-sensitive default values and serves as documentation:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/brain_log"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production"

# OpenAI Integration
OPENAI_API_KEY="sk-your-key-here"
OPENAI_MODEL="gpt-3.5-turbo"

# Optional: Email Service
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-username"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@example.com"

# Development Flags
NODE_ENV="development"
```

### .env.example (Reference Template)

This file shows the structure without any actual values:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-32-character-minimum-secret

# OpenAI Integration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo

# Email Service (Optional)
EMAIL_SERVER_HOST=smtp.your-provider.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email-username
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@your-domain.com
```

## Environment-Specific Configurations

### Development Environment

**File: `.env.local`** (git-ignored)

```env
# Local development database
DATABASE_URL="postgresql://postgres:password@localhost:5432/brain_log_dev"

# Local authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-for-local-testing-only"

# Development OpenAI key (with usage limits)
OPENAI_API_KEY="sk-development-key"

# Local email testing (optional)
EMAIL_SERVER_HOST="smtp.mailtrap.io"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-mailtrap-user"
EMAIL_SERVER_PASSWORD="your-mailtrap-password"
EMAIL_FROM="test@localhost"

NODE_ENV="development"
```

### Production Environment

**File: `.env.production.local`** (git-ignored)

```env
# Production database (Neon, Supabase, etc.)
DATABASE_URL="postgresql://prod_user:secure_password@prod-host.neon.tech:5432/brain_log_prod?sslmode=require"

# Production authentication
NEXTAUTH_URL="https://brain-log-app.vercel.app"
NEXTAUTH_SECRET="ultra-secure-production-secret-minimum-32-characters"

# Production OpenAI key
OPENAI_API_KEY="sk-production-key-with-rate-limits"

# Production email service
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="re_production_api_key"
EMAIL_FROM="noreply@yourdomain.com"

NODE_ENV="production"
```

## Security Best Practices

### Secret Generation

```bash
# Generate secure NextAuth secret
openssl rand -base64 32

# Generate secure database password
openssl rand -base64 24

# Alternative using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Environment Variable Security

1. **Never commit sensitive values**:
   - API keys
   - Database passwords
   - Authentication secrets
   - Production URLs with credentials

2. **Use strong secrets**:
   - Minimum 32 characters for NEXTAUTH_SECRET
   - Random generation for all secrets
   - Different secrets per environment

3. **Rotate secrets regularly**:
   - Change production secrets quarterly
   - Update after security incidents
   - Use different secrets per environment

### Git Configuration

Ensure your `.gitignore` includes:

```gitignore
# Environment files
.env.local
.env.production.local
.env.*.local

# Keep committed templates
!.env
!.env.example
```

## Edge Runtime Considerations

### Split Configuration Architecture

The application uses a hybrid runtime model requiring split configurations:

**Edge Runtime (middleware.ts):**
- Uses `auth.config.ts` (no database access)
- Limited to Edge-compatible packages
- Handles route protection and basic auth

**Node.js Runtime (API routes):**
- Uses `auth.ts` (full database access)
- Complete authentication features
- Database operations and complex logic

### Environment Variables for Edge Runtime

```env
# Edge-compatible configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret"

# Database URL (used by Node.js API routes only)
DATABASE_URL="postgresql://..."

# Edge Runtime automatically inherits these variables
# No additional configuration needed for split runtime
```

## Platform-Specific Configuration

### Vercel Deployment

Environment variables are configured in the Vercel dashboard:

1. **Project Settings** → **Environment Variables**
2. **Add variables for each environment**:
   - Development
   - Preview
   - Production

**Vercel-specific considerations:**
```env
# Vercel automatically sets these
VERCEL="1"
VERCEL_URL="your-deployment-url.vercel.app"

# Use VERCEL_URL for dynamic NEXTAUTH_URL
NEXTAUTH_URL="${VERCEL_URL}"
```

### Local Development Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in development values**:
   - Local database URL
   - Development API keys
   - Test email credentials

3. **Verify configuration**:
   ```bash
   npm run dev
   # Check console for environment variable loading
   ```

## Configuration Validation

### Runtime Validation

The application validates required environment variables on startup:

```typescript
// src/lib/config/env-validation.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'OPENAI_API_KEY'
];

function validateEnvironment() {
  const missing = requiredEnvVars.filter(
    varName => !process.env[varName]
  );
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

### Development Checks

Add to your development workflow:

```bash
# Check environment variable loading
npm run dev -- --inspect-env

# Validate all required variables are set
npm run validate-env
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading**:
   - Check file naming (`.env.local` not `.env-local`)
   - Verify file location (project root)
   - Restart development server

2. **Wrong values in production**:
   - Check environment priority order
   - Verify platform environment variable settings
   - Ensure production files are git-ignored

3. **Edge Runtime errors**:
   - Use `auth.config.ts` for middleware
   - Avoid Node.js-only packages in Edge Runtime
   - Check Next.js Edge Runtime compatibility

### Debugging Environment Variables

```typescript
// Add to development mode for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Missing'
  });
}
```

## Related Documents

- [Vercel Deployment Guide](02-vercel-deployment.md)
- [Database Setup](03-database-setup.md)
- [Authentication Architecture](../02-architecture/05-authentication.md)

## Changelog

- **2025-07-06**: Initial documentation of environment configuration strategy

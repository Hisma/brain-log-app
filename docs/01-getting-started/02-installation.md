---
title: Installation and Development Environment Setup
description: Complete guide for setting up the Brain Log App development environment
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Installation and Development Environment Setup

## Overview

This guide provides step-by-step instructions for setting up the Brain Log App development environment, including all prerequisites, dependencies, database configuration, and verification procedures.

## Prerequisites

### Required Software

#### Node.js
- **Version**: 18.17.0 or later (recommended: 20.x LTS)
- **Download**: [nodejs.org](https://nodejs.org/)
- **Verification**: 
  ```bash
  node --version  # Should show v18.17.0 or higher
  npm --version   # Should show 8.x or higher
  ```

#### Package Manager
Choose one of the following:
- **npm** (included with Node.js) - recommended for beginners
- **yarn** (optional) - `npm install -g yarn`
- **pnpm** (optional) - `npm install -g pnpm`

#### Git
- **Version**: 2.25 or later
- **Download**: [git-scm.com](https://git-scm.com/)
- **Verification**: 
  ```bash
  git --version  # Should show 2.25 or higher
  ```

### Database Requirements

#### PostgreSQL Database
You'll need access to a PostgreSQL database. Choose one option:

**Option 1: Neon Database (Recommended)**
- **Service**: [neon.tech](https://neon.tech/)
- **Benefits**: Serverless, automatic scaling, Edge Runtime compatible
- **Setup**: Create free account and database instance

**Option 2: Local PostgreSQL**
- **Version**: PostgreSQL 12 or later
- **Download**: [postgresql.org](https://www.postgresql.org/downloads/)
- **Setup**: Create database named `brain_log_db`

**Option 3: Docker PostgreSQL**
```bash
docker run --name brain-log-postgres \
  -e POSTGRES_DB=brain_log_db \
  -e POSTGRES_USER=your_username \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

### Development Tools (Recommended)

#### Code Editor
- **Visual Studio Code** with extensions:
  - TypeScript and JavaScript Language Features
  - Prisma (for database schema)
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

#### API Testing (Optional)
- **Postman** or **Insomnia** for API testing
- **REST Client** VS Code extension

## Installation Steps

### 1. Repository Setup

#### Clone the Repository
```bash
# Using HTTPS
git clone https://github.com/yourusername/brain-log-app.git

# Using SSH (if configured)
git clone git@github.com:yourusername/brain-log-app.git

# Navigate to project directory
cd brain-log-app
```

#### Verify Repository Structure
```bash
ls -la
# You should see:
# - package.json
# - prisma/
# - src/
# - docs/
# - README.md
```

### 2. Dependency Installation

#### Install Project Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

#### Verify Installation
```bash
# Check that node_modules was created
ls -la node_modules

# Verify key dependencies
npm ls next prisma @prisma/client
```

### 3. Environment Configuration

#### Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Or create manually
touch .env
```

#### Configure Environment Variables
Edit `.env` file with your specific values:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database_name"

# For Neon Database (example):
# DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/brain_log_db?sslmode=require"

# For Local PostgreSQL (example):
# DATABASE_URL="postgresql://postgres:password@localhost:5432/brain_log_db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-secret-key-here"

# OpenAI Configuration (for AI insights)
OPENAI_API_KEY="your-openai-api-key-here"

# Neon Database Direct Connection (if using Neon)
NEON_DATABASE_URL="postgresql://username:password@host:port/database_name"
```

#### Generate Secure Keys
```bash
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Alternative using OpenSSL
openssl rand -hex 32
```

### 4. Database Setup

#### Generate Prisma Client
```bash
npx prisma generate
```

#### Database Migration
```bash
# Apply database schema
npx prisma db push

# Alternative: Run migrations (if available)
npx prisma migrate deploy
```

#### Verify Database Connection
```bash
# Open Prisma Studio to verify database
npx prisma studio
# Opens browser at http://localhost:5555
```

### 5. Development Server

#### Start Development Server
```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev

# With Turbopack (faster, experimental)
npm run dev --turbo
```

#### Verify Server Startup
- Server should start on `http://localhost:3000`
- Console should show:
  ```
  ▲ Next.js 15.3.2
  - Local:        http://localhost:3000
  - Environments: .env
  ```

## Verification Checklist

### 1. Application Access
- [ ] Open `http://localhost:3000` in browser
- [ ] Application loads without errors
- [ ] Dark/light mode toggle works
- [ ] Navigation menu is functional

### 2. Authentication System
- [ ] Navigate to `/register`
- [ ] Create test user account
- [ ] Login with test account
- [ ] Access protected pages (dashboard)

### 3. Database Functionality
- [ ] Create a daily log entry
- [ ] View data in Prisma Studio
- [ ] Verify data persistence

### 4. API Endpoints
- [ ] Test API at `http://localhost:3000/api/users`
- [ ] Verify authentication responses
- [ ] Check error handling

## Development Environment Optimization

### 1. VS Code Configuration

#### Recommended Settings (.vscode/settings.json)
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

#### Recommended Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### 2. Git Configuration

#### Git Hooks Setup (Optional)
```bash
# Install husky for git hooks
npm install --save-dev husky

# Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npm run lint"
```

### 3. Performance Optimization

#### Memory Configuration (if needed)
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or in package.json scripts:
"dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: Database Connection Errors
```bash
# Error: Can't reach database server
# Solution: Verify DATABASE_URL and database server status

# Test database connection
npx prisma db pull
```

#### Issue: Port Already in Use
```bash
# Error: Port 3000 is already in use
# Solution: Use different port or kill existing process

# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
npm run dev -- -p 3001
```

#### Issue: Module Not Found Errors
```bash
# Error: Cannot find module 'xyz'
# Solution: Clear cache and reinstall

# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Prisma Generation Errors
```bash
# Error: Prisma client out of sync
# Solution: Regenerate Prisma client

npx prisma generate
npx prisma db push
```

#### Issue: Environment Variables Not Loading
```bash
# Verify .env file location (should be in project root)
ls -la .env

# Check file format (no spaces around = sign)
# Restart development server after changes
```

### Getting Help

#### Log Analysis
```bash
# Check development server logs
npm run dev 2>&1 | tee dev.log

# Check database logs
npx prisma studio --browser none
```

#### Debug Mode
```bash
# Run with debug output
DEBUG=* npm run dev

# Or specific modules
DEBUG=prisma:* npm run dev
```

## Next Steps

After successful installation:

1. **Explore Project Structure**: Review [Project Structure Guide](03-project-structure.md)
2. **Learn Development Workflow**: Study [Development Workflow](04-development-workflow.md)
3. **Understand Architecture**: Read [Architecture Documentation](../02-architecture/)
4. **Review API Endpoints**: Check [API Reference](../03-api-reference/)

## Production Deployment

For production deployment instructions, see:
- [Deployment Guide](../05-deployment/) - Complete production setup
- [Vercel Deployment](../05-deployment/02-vercel-deployment.md) - Vercel-specific instructions
- [Environment Configuration](../05-deployment/01-environments.md) - Production environment setup

## Related Documents
- [Project Structure](03-project-structure.md) - Codebase organization
- [Development Workflow](04-development-workflow.md) - Development process
- [Architecture Overview](../02-architecture/01-overview.md) - System design
- [Database Documentation](../02-architecture/04-database.md) - Database schema details

## Changelog
- 2025-07-06: Initial installation guide created
- 2025-07-06: Environment configuration and troubleshooting added
- 2025-07-06: Verification procedures and optimization tips included

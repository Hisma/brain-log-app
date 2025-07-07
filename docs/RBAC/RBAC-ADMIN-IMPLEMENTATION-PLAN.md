---
title: RBAC & Admin Panel Implementation Plan
description: Comprehensive implementation plan for Role-Based Access Control and Admin Panel with user approval workflow
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: in-progress
priority: high
---

# RBAC & Admin Panel Implementation Plan

## Executive Summary

This document provides a comprehensive implementation plan for adding Role-Based Access Control (RBAC) and an admin panel with user approval workflow to the Brain Log App. The implementation addresses technical debt item #4 from `docs/07-maintenance/02-technical-debt.md` and implements modern security practices for the publicly deployed application.

### Key Objectives
- **Secure Public Access**: Implement admin approval for new user registrations
- **Role-Based Security**: Three-tier access control (admin, user, pending)
- **Admin Management**: Comprehensive admin panel for user and system management
- **Production-Ready**: Email notifications, audit logging, and security hardening
- **Modern Architecture**: Leverages Next.js 15, Auth.js v5, and Edge Runtime patterns

### Implementation Timeline
- **Week 1**: Database schema and core RBAC implementation
- **Week 2**: User approval workflow and email notifications
- **Week 3**: Comprehensive admin panel development
- **Week 4**: Security hardening and production deployment

## Research & Best Practices Summary

### Industry Standards (2025)
Based on research of current Next.js 15 and Auth.js v5 best practices:

**1. Session-Based Role Storage**
- Attach roles directly to JWT sessions for Edge Runtime performance
- Minimal database queries for route protection
- Type-safe role checking with TypeScript enums

**2. Edge-First Security**
- Middleware for route protection at CDN edge
- Sub-50ms authentication checks globally
- Fallback to Node.js runtime for complex operations

**3. Modern User Approval Workflow**
- Three-state system: `PENDING` → `USER` → `ADMIN`
- Email-driven approval process with admin notifications
- Audit logging for compliance and security

**4. Production Email Integration**
- Resend API for modern, Next.js-optimized email delivery
- React-based email templates for consistent branding
- Reliable delivery with retry logic and monitoring

### Security Architecture
- **Defense in Depth**: Edge middleware + API validation + database constraints
- **Audit Trail**: Complete logging of administrative actions
- **Rate Limiting**: Protection against brute force and abuse
- **Session Security**: Proper token management and invalidation

## Technical Architecture

### Role-Based Access Control System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Edge Middleware Layer                        │
│  ├── JWT Role Verification (10-50ms globally)                  │
│  ├── Route Protection Based on User Role                       │
│  ├── Automatic Redirects (pending/login/admin)                 │
│  └── Rate Limiting and Security Headers                        │
├─────────────────────────────────────────────────────────────────┤
│                   Application Layer                             │
│  ├── Role-Based UI Components                                  │
│  ├── Conditional Navigation and Features                       │
│  ├── User Status Management                                    │
│  └── Admin Panel with User Management                          │
├─────────────────────────────────────────────────────────────────┤
│                    API Layer                                    │
│  ├── Role Validation on All Endpoints                          │
│  ├── User Approval/Rejection APIs                              │
│  ├── Admin-Only Operations                                     │
│  └── Audit Logging for All Actions                             │
├─────────────────────────────────────────────────────────────────┤
│                   Database Layer                                │
│  ├── Enhanced User Model with Roles                            │
│  ├── System Settings Management                                │
│  ├── Audit Log Storage                                         │
│  └── Registration Token Management                             │
└─────────────────────────────────────────────────────────────────┘
```

### User State Flow

```
New User Registration
      ↓
[PENDING] ──────────────────→ [REJECTED]
      ↓                           ↓
Admin Approval               Email Sent
      ↓                           ↓
   [USER] ←─────────────────────┤ End
      ↓
 Admin Elevation
      ↓
   [ADMIN]
```

### Route Protection Matrix

| Route Pattern | Anonymous | PENDING | USER | ADMIN |
|---------------|-----------|---------|------|-------|
| `/login` | ✅ | ✅ | → `/` | → `/` |
| `/register` | ✅ | → `/pending` | → `/` | → `/` |
| `/pending` | → `/login` | ✅ | → `/` | → `/` |
| `/` (dashboard) | → `/login` | → `/pending` | ✅ | ✅ |
| `/daily-log/*` | → `/login` | → `/pending` | ✅ | ✅ |
| `/insights/*` | → `/login` | → `/pending` | ✅ | ✅ |
| `/admin/*` | → `/login` | → `/pending` | → `/` | ✅ |
| `/api/admin/*` | 401 | 403 | 403 | ✅ |

## Implementation Phases

The implementation has been broken down into 4 detailed phases, each with comprehensive technical specifications, code examples, and implementation checklists:

### Phase 1: Database Schema & Core RBAC (Week 1)
**📄 [RBAC-ADMIN-IMPLEMENTATION-PH-1.md](./RBAC-ADMIN-IMPLEMENTATION-PH-1.md)**

- Enhanced Prisma schema with UserRole enum, SystemSettings, and AuditLog models
- Auth.js v5 configuration with role-based JWT callbacks
- Enhanced middleware with security headers and route protection
- TypeScript definitions for user roles and permissions
- Audit logging and role utility functions
- Account lockout and failed login attempt tracking

### Phase 2: User Registration & Approval Workflow (Week 1-2)
**📄 [RBAC-ADMIN-IMPLEMENTATION-PH-2.md](./RBAC-ADMIN-IMPLEMENTATION-PH-2.md)**

- Enhanced registration page with system status checking
- Pending status page for users awaiting approval
- Registration API with validation and admin notifications
- Email queue system for reliable delivery
- Resend email service integration
- React-based email templates for admin notifications and user communications

### Phase 3: Comprehensive Admin Panel (Week 2-3)
**📄 [RBAC-ADMIN-IMPLEMENTATION-PH-3.md](./RBAC-ADMIN-IMPLEMENTATION-PH-3.md)**

- Admin dashboard with user statistics and system health
- User management interface with approval/rejection workflows
- System settings management page
- Admin API endpoints for user operations
- Audit log viewer with filtering and search
- Bulk user operations and email queue monitoring

### Phase 4: Production Features & Security (Week 3-4)
**📄 [RBAC-ADMIN-IMPLEMENTATION-PH-4.md](./RBAC-ADMIN-IMPLEMENTATION-PH-4.md)**

- Email processing cron job for Vercel
- Environment variable configuration for production
- Package dependencies and Vercel configuration
- Initial admin user setup script
- Security hardening and rate limiting
- Production monitoring and alerting setup

## Deployment Guide

### 1. Database Migration

```bash
# Run the migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Create initial admin user
node scripts/create-admin.js admin@yourdomain.com secure-password "Admin User"
```

### 2. Environment Setup

1. **Resend Setup**:
   - Create account at [resend.com](https://resend.com)
   - Get API key and configure domain
   - Add API key to environment variables

2. **Vercel Deployment**:
   - Configure environment variables in Vercel dashboard
   - Enable cron jobs for email processing
   - Deploy application

3. **DNS Configuration**:
   - Set up email domain with Resend
   - Configure SPF, DKIM, and DMARC records

### 3. Testing Checklist

- [ ] User registration creates pending user
- [ ] Admin receives notification email
- [ ] Admin can approve/reject from email links
- [ ] Admin can manage users from dashboard
- [ ] Users receive approval/rejection emails
- [ ] Route protection works for all roles
- [ ] Audit logging captures all actions
- [ ] Email queue processes correctly
- [ ] System settings can be updated
- [ ] Password security requirements enforced

### 4. Security Verification

- [ ] Admin routes require ADMIN role
- [ ] User routes require USER/ADMIN roles
- [ ] Pending users cannot access protected routes
- [ ] JWT tokens include role information
- [ ] Password hashing uses PBKDF2 with 100,000 iterations
- [ ] Failed login attempts are tracked and locked
- [ ] Audit logs capture all security events
- [ ] CSRF protection enabled
- [ ] Security headers configured

### 5. Monitoring Setup

- [ ] Monitor email delivery rates
- [ ] Track user registration/approval metrics
- [ ] Set up alerts for failed email processing
- [ ] Monitor audit log for security events
- [ ] Track system performance and errors

## Maintenance Procedures

### Daily Tasks
- Review pending user registrations
- Check email queue status
- Monitor audit logs for security events

### Weekly Tasks
- Review user activity and engagement
- Check system performance metrics
- Update any failed email deliveries

### Monthly Tasks
- Security audit of user accounts
- Review and update system settings
- Analyze user registration patterns

## Troubleshooting Guide

### Common Issues

**1. Email Not Sending**
- Check Resend API key configuration
- Verify domain setup and DNS records
- Check email queue for failed attempts
- Review cron job execution logs

**2. User Cannot Login**
- Check user role and active status
- Verify password hash format
- Check for account lockout
- Review authentication logs

**3. Admin Panel Not Accessible**
- Verify user has ADMIN role
- Check JWT token for role information
- Verify middleware configuration
- Check session validity

**4. Registration Not Working**
- Check if registration is enabled in system settings
- Verify database connection
- Check for username conflicts
- Review validation errors

## Related Documents

- [`docs/02-architecture/05-authentication.md`](docs/02-architecture/05-authentication.md) - Authentication system architecture
- [`docs/07-maintenance/02-technical-debt.md`](docs/07-maintenance/02-technical-debt.md) - Original technical debt item
- [`docs/08-frameworks/02-authjs5-implementation.md`](docs/08-frameworks/02-authjs5-implementation.md) - Auth.js v5 patterns
- [`docs/06-guides/03-testing.md`](docs/06-guides/03-testing.md) - Testing procedures

## Changelog

- **2025-07-06**: Initial implementation plan created with research findings
- **2025-07-06**: Database schema and core RBAC design completed
- **2025-07-06**: User approval workflow and email system designed
- **2025-07-06**: Admin panel architecture and API endpoints planned
- **2025-07-06**: Production deployment and security procedures documented

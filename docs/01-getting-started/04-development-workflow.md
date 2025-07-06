---
title: Development Workflow
description: Development process, coding standards, and best practices for Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Development Workflow

## Overview

This guide establishes development standards, processes, and best practices for Brain Log App development. It covers Git workflow, coding conventions, testing procedures, and deployment practices to ensure consistent, maintainable code.

## Git Workflow

### Branch Strategy

Brain Log App uses **GitHub Flow** - a simplified workflow suitable for continuous deployment:

```
main (production)
├── feature/user-authentication
├── feature/daily-log-improvements
├── hotfix/session-timeout-bug
└── docs/api-documentation
```

#### Branch Types

**`main`** - Production-ready code
- Always deployable
- Protected branch with required reviews
- Automatic deployment to production

**`feature/*`** - New features and enhancements
- Branch from `main`
- Descriptive naming: `feature/weekly-insights-chart`
- Merge via Pull Request

**`hotfix/*`** - Critical bug fixes
- Branch from `main` for urgent fixes
- Fast-track review process
- Immediate deployment after merge

**`docs/*`** - Documentation updates
- Independent documentation changes
- Can be merged without extensive testing

### Git Commands Workflow

#### Starting New Feature
```bash
# Ensure main is current
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Work on feature...
git add .
git commit -m "feat: add new daily log visualization"

# Push feature branch
git push -u origin feature/your-feature-name
```

#### Maintaining Feature Branch
```bash
# Regularly sync with main
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main

# Or use rebase for cleaner history
git rebase main
```

#### Completing Feature
```bash
# Final commit and push
git add .
git commit -m "feat: complete daily log chart implementation"
git push origin feature/your-feature-name

# Create Pull Request via GitHub UI
# After approval and merge, clean up
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

### Commit Message Standards

Follow **Conventional Commits** specification for clear, searchable history:

#### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates

#### Examples
```bash
feat(auth): implement JWT session refresh mechanism
fix(daily-log): resolve timezone calculation bug
docs(api): update weekly reflection endpoint documentation
refactor(forms): extract common validation logic
chore(deps): update Next.js to version 15.3.2
```

## Code Standards

### TypeScript Guidelines

#### Type Safety
```typescript
// ✅ Good: Explicit types
interface DailyLogEntry {
  id: string;
  userId: string;
  date: Date;
  mood: number;
  focusLevel: number;
}

// ❌ Avoid: Any types
const data: any = fetchDailyLogs();
```

#### Interface vs Type
```typescript
// ✅ Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  name: string;
}

// ✅ Use types for unions, primitives, computed types
type MoodLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type ApiResponse<T> = {
  data: T;
  success: boolean;
  error?: string;
};
```

#### Import/Export Patterns
```typescript
// ✅ Named exports for utilities
export const formatDate = (date: Date): string => { ... };
export const validateEmail = (email: string): boolean => { ... };

// ✅ Default export for components
export default function MorningCheckInForm() { ... }

// ✅ Consistent import grouping
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { DailyLog } from '@/types/daily-log';
```

### React Component Guidelines

#### Component Structure
```typescript
// ✅ Consistent component structure
interface ComponentProps {
  userId: string;
  onSubmit: (data: FormData) => void;
  className?: string;
}

export default function ComponentName({ 
  userId, 
  onSubmit, 
  className 
}: ComponentProps) {
  // 1. Hooks
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  
  // 2. Event handlers
  const handleSubmit = useCallback((formData: FormData) => {
    setLoading(true);
    onSubmit(formData);
  }, [onSubmit]);
  
  // 3. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 4. Render
  return (
    <div className={cn("default-styles", className)}>
      {/* Component content */}
    </div>
  );
}
```

#### Styling with Tailwind
```typescript
// ✅ Use cn() for conditional classes
import { cn } from '@/lib/utils';

<Button 
  className={cn(
    "base-styles",
    isActive && "active-styles",
    variant === "primary" && "primary-styles"
  )}
>
  Button Text
</Button>

// ✅ Extract complex class combinations
const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
  danger: "bg-red-600 hover:bg-red-700 text-white"
};
```

### API Route Standards

#### Route Handler Structure
```typescript
// ✅ Consistent API route structure
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Input validation
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    // 3. Business logic
    const data = await fetchUserData(userId);
    
    // 4. Response
    return NextResponse.json({ data, success: true });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

#### Error Handling Pattern
```typescript
// ✅ Consistent error responses
interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

interface ApiSuccess<T> {
  data: T;
  success: true;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

## File Organization

### Import Order
```typescript
// 1. Node modules
import React, { useState, useEffect } from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. Internal components and utilities
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';

// 3. Types and interfaces
import type { User, DailyLog } from '@/types';

// 4. Relative imports
import './component.css';
```

### File Naming
- **Components**: `PascalCase.tsx` (e.g., `MorningCheckInForm.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `apiClient.ts`)
- **Types**: `camelCase.ts` (e.g., `dailyLog.ts`)
- **API routes**: `route.ts` in appropriate directory
- **Pages**: `page.tsx` in App Router directory

## Testing Strategy

### Testing Levels

#### Unit Tests
```typescript
// Example: Utility function test
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });
  
  it('handles invalid dates', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow();
  });
});
```

#### Integration Tests
```typescript
// Example: API route test
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/daily-logs/route';

describe('/api/daily-logs', () => {
  it('returns user daily logs', async () => {
    const request = new Request('http://localhost/api/daily-logs?userId=123');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

#### Component Tests
```typescript
// Example: Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MorningCheckInForm from '@/components/forms/MorningCheckInForm';

describe('MorningCheckInForm', () => {
  it('submits form with correct data', () => {
    const onSubmit = vi.fn();
    render(<MorningCheckInForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/mood/i), { 
      target: { value: '8' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ mood: 8 })
    );
  });
});
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- MorningCheckInForm.test.tsx
```

## Development Environment

### VS Code Configuration

#### Settings (`.vscode/settings.json`)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### Extensions (`.vscode/extensions.json`)
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### ESLint Configuration

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'import/order': ['error', {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always'
      }]
    }
  }
];
```

## Database Development

### Schema Changes
```bash
# 1. Update prisma/schema.prisma
# 2. Generate migration
npx prisma migrate dev --name add_user_preferences

# 3. Generate client
npx prisma generate

# 4. Test in Prisma Studio
npx prisma studio
```

### Migration Best Practices
- **Descriptive names**: `add_user_preferences`, `fix_timezone_handling`
- **Backward compatible**: Avoid breaking changes when possible
- **Data migration**: Include data transformation in migration files
- **Testing**: Test migrations on sample data before production

## Performance Guidelines

### Code Splitting
```typescript
// ✅ Dynamic imports for large components
const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

// ✅ Route-level code splitting (automatic with App Router)
// Each page.tsx file creates its own bundle
```

### Image Optimization
```typescript
// ✅ Use Next.js Image component
import Image from 'next/image';

<Image
  src="/profile-picture.jpg"
  alt="User profile"
  width={200}
  height={200}
  priority={true} // For above-the-fold images
/>
```

### Database Queries
```typescript
// ✅ Efficient queries with proper includes
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    dailyLogs: {
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    }
  }
});
```

## Deployment Process

### Development Deployment
```bash
# 1. Ensure all tests pass
npm test

# 2. Build application
npm run build

# 3. Test production build locally
npm start

# 4. Commit and push
git add .
git commit -m "feat: implement new feature"
git push origin feature-branch
```

### Production Deployment (Vercel)
```bash
# Automatic deployment on main branch merge
# Manual deployment for testing:
vercel --prod
```

### Environment Variables
```bash
# Development (.env.local)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="dev-secret-key"
OPENAI_API_KEY="sk-..."

# Production (Vercel Dashboard)
# Set all environment variables in Vercel project settings
```

## Code Review Guidelines

### Pull Request Checklist

#### Before Creating PR
- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated if needed
- [ ] No console.log statements in production code
- [ ] Environment variables documented

#### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]
```

### Review Process
1. **Automated checks** must pass (ESLint, tests, build)
2. **Manual review** by team member
3. **Approval required** before merge
4. **Squash and merge** to maintain clean history

## Troubleshooting

### Common Issues

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf .next/
npm run build

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

#### Database Issues
```bash
# Reset database (development only)
npx prisma migrate reset

# Generate fresh client
npx prisma generate
```

#### Build Failures
```bash
# Clear all caches
rm -rf .next/ node_modules/ package-lock.json
npm install
npm run build
```

### Getting Help
- **Documentation**: Start with relevant docs in `/docs/`
- **Code Examples**: Look at similar implementations in codebase
- **Error Messages**: Include full error output when asking for help
- **Reproduction Steps**: Provide minimal steps to reproduce issues

## Related Documents
- [Introduction](01-introduction.md) - Project overview and features
- [Installation](02-installation.md) - Development environment setup
- [Project Structure](03-project-structure.md) - Codebase organization
- [Architecture Overview](../02-architecture/01-overview.md) - System design
- [API Reference](../03-api-reference/) - API documentation

## Changelog
- 2025-07-06: Initial development workflow documentation
- 2025-07-06: Git workflow and coding standards established
- 2025-07-06: Testing guidelines and deployment process added

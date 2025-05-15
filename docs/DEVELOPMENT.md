# Brain Log App - Development Guide

This document provides guidelines and instructions for developers working on the Brain Log App.

## Development Environment Setup

### Prerequisites

- Node.js (v18.17.0 or later)
- npm, yarn, or pnpm
- PostgreSQL (v12 or later)
- Git

### Initial Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/brain-log-app.git
cd brain-log-app
```

2. Install dependencies:

```bash
# Using npm
npm install
# Using yarn
yarn
# Using pnpm
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
# Database configuration
DATABASE_URL="postgresql://username:password@localhost:5432/brain_log_db"

# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret-key
```

4. Set up the database:

```bash
# Create the database
createdb brain_log_db

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push
```

5. Start the development server:

```bash
# Using npm
npm run dev
# Using yarn
yarn dev
# Using pnpm
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

The project follows a standard Next.js structure with some additional directories:

```
brain-log-app/
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   └── ...            # Page routes
│   ├── components/        # React components
│   │   ├── common/        # Common components
│   │   ├── forms/         # Form components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   ├── lib/               # Utility functions and services
│   │   ├── auth/          # Authentication utilities
│   │   ├── db/            # Database utilities
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
│   └── types/             # TypeScript type definitions
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── ...                    # Configuration files
```

## Development Workflow

### Branching Strategy

We follow a simplified Git Flow branching strategy:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/feature-name`: Feature branches
- `bugfix/bug-name`: Bug fix branches

### Development Process

1. Create a new branch from `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:

```bash
git add .
git commit -m "Description of your changes"
```

3. Push your branch to the remote repository:

```bash
git push -u origin feature/your-feature-name
```

4. Create a pull request to merge your changes into `develop`.

### Code Style

We follow a consistent code style using ESLint and Prettier:

- Use TypeScript for type safety
- Follow the Airbnb JavaScript Style Guide
- Use functional components with hooks
- Use async/await for asynchronous code

### Commit Message Format

We follow the Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or tools

Example:
```
feat(auth): add password reset functionality

- Add password reset form
- Add API endpoint for password reset
- Add email notification for password reset
```

## Database Management

### Prisma ORM

We use Prisma ORM for database access. The database schema is defined in `prisma/schema.prisma`.

#### Common Prisma Commands

- Generate Prisma client:

```bash
npx prisma generate
```

- Create database tables:

```bash
npx prisma db push
```

- Open Prisma Studio (database GUI):

```bash
npx prisma studio
```

### Database Migrations

For production environments, we use Prisma Migrate to manage database schema changes:

1. Create a migration:

```bash
npx prisma migrate dev --name migration-name
```

2. Apply migrations in production:

```bash
npx prisma migrate deploy
```

## API Development

### API Routes

API routes are defined in the `src/app/api` directory. Each route should:

- Validate input data
- Check authentication
- Perform the requested operation
- Return a JSON response

Example API route:

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get data from the database
    const data = await prisma.someModel.findMany({
      where: { userId }
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

### Client-Side API Services

Client-side API services are defined in the `src/lib/services` directory. Each service should:

- Provide functions for interacting with API endpoints
- Handle error responses
- Return typed data

Example service function:

```typescript
import { fetchApi } from './api';

export async function getData(userId: number) {
  try {
    return await fetchApi<DataType>(`some-endpoint/${userId}`);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
```

## Authentication

### NextAuth.js

We use NextAuth.js for authentication. The configuration is defined in `src/lib/auth/auth-options.ts`.

### Authentication Context

The authentication context is defined in `src/lib/auth/AuthContext.tsx`. It provides:

- User authentication state
- Login and logout functions
- User registration function

Example usage:

```tsx
import { useAuth } from '@/lib/auth/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }
  
  return (
    <div>
      <p>Welcome, {user.displayName}</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}
```

## Component Development

### shadcn/ui Components

The Brain Log App uses [shadcn/ui](https://ui.shadcn.com/) for its UI component system. shadcn/ui is not a traditional component library but rather a collection of reusable components built on top of Tailwind CSS and Radix UI primitives.

#### shadcn/ui Configuration

The shadcn/ui configuration is defined in `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

#### Adding New shadcn/ui Components

To add a new shadcn/ui component:

1. Use the shadcn/ui CLI:

```bash
npx shadcn-ui@latest add button
```

2. This will add the component to the `src/components/ui` directory.

3. Import and use the component in your application:

```tsx
import { Button } from "@/components/ui/Button";

function MyComponent() {
  return <Button>Click me</Button>;
}
```

#### Customizing shadcn/ui Components

One of the key benefits of shadcn/ui is that components are part of your project and can be customized:

1. Modify the component file directly in `src/components/ui`.
2. Update the styling using Tailwind CSS classes.
3. Add new variants or properties as needed.

Example of customizing a Button component:

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Customize the button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Add a new custom variant
        custom: "bg-purple-600 text-white hover:bg-purple-700",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

#### Theming with shadcn/ui

shadcn/ui uses CSS variables for theming, defined in `src/styles/globals.css`:

1. Light and dark mode themes are defined using CSS variables.
2. The theme can be customized by modifying these variables.
3. The theme is applied using the `theme` attribute on the `html` element.

Example of theme customization:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}
```

#### Best Practices for shadcn/ui

1. **Use Existing Components**: Before creating a new component, check if shadcn/ui already provides one that meets your needs.

2. **Consistent Styling**: Follow the established design patterns and styling conventions.

3. **Accessibility**: shadcn/ui components are built with accessibility in mind. Maintain this by:
   - Using proper ARIA attributes
   - Ensuring keyboard navigation works
   - Maintaining sufficient color contrast

4. **Component Composition**: Compose complex UI elements from simpler shadcn/ui components.

5. **Theme Consistency**: Use the theme variables instead of hardcoded colors.

### Custom UI Components

For custom UI components not provided by shadcn/ui, follow these guidelines:

- Be reusable and composable
- Accept props with TypeScript types
- Follow accessibility best practices
- Support dark mode using the same theme variables as shadcn/ui

Example custom component:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CardStatsProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export function CardStats({
  title,
  value,
  icon,
  trend,
  className,
}: CardStatsProps) {
  return (
    <div className={cn(
      'rounded-lg border bg-card p-4 shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-xs">
          <span className={cn(
            'mr-1',
            trend.direction === 'up' && 'text-green-500',
            trend.direction === 'down' && 'text-red-500',
            trend.direction === 'neutral' && 'text-muted-foreground'
          )}>
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            {trend.direction === 'neutral' && '→'}
            {trend.value}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
```

### Form Components

Form components are defined in the `src/components/forms` directory. Each form should:

- Handle form state and validation
- Provide clear error messages
- Support keyboard navigation
- Be accessible

Example form:

```tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await onSubmit(username, password);
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium">
          Username
        </label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
}
```

## Testing

### Unit Testing

We use Jest and React Testing Library for unit testing. Tests are located in `__tests__` directories next to the files they test.

Example test:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Integration Testing

Integration tests are located in the `__tests__` directory at the root of the project.

### End-to-End Testing

We use Cypress for end-to-end testing. Tests are located in the `cypress` directory.

## Deployment

### Development Deployment

For development and testing, we deploy to Vercel's preview environments:

1. Push your changes to a feature branch
2. Vercel will automatically create a preview deployment
3. Review the preview deployment and share with stakeholders

### Production Deployment

For production deployment:

1. Merge changes into the `main` branch
2. Vercel will automatically deploy to production
3. Verify the production deployment

### Environment Variables

Set the following environment variables in your deployment environment:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: URL of the deployed application
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js

## Performance Optimization

### Frontend Optimization

- Use Next.js Image component for optimized images
- Implement code splitting with dynamic imports
- Minimize JavaScript bundle size
- Use React.memo for expensive components

### Database Optimization

- Add indexes for frequently queried fields
- Use Prisma's select and include to fetch only needed data
- Implement pagination for large data sets

### API Optimization

- Implement caching for frequently accessed data
- Use HTTP caching headers
- Optimize database queries

## Accessibility

We strive to make the application accessible to all users:

- Use semantic HTML elements
- Provide alternative text for images
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers

## Troubleshooting

### Common Issues

#### Database Connection Issues

- Check that PostgreSQL is running
- Verify the DATABASE_URL environment variable
- Check database user permissions

#### Authentication Issues

- Verify NEXTAUTH_URL and NEXTAUTH_SECRET environment variables
- Check that cookies are being set correctly
- Verify that the user exists in the database

#### API Issues

- Check browser console for errors
- Verify that API routes are returning the expected data
- Check that authentication is working correctly

### Debugging

- Use console.log for basic debugging
- Use the React Developer Tools browser extension
- Use the Network tab in browser developer tools
- Use Prisma Studio to inspect the database

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

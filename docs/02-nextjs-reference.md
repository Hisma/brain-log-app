# Next.js Reference Guide

This guide provides a reference for key Next.js concepts and patterns that we'll use in the Brain Log App.

## App Router Basics

Next.js 13+ introduced the App Router, which is a new routing system that uses React Server Components by default. The App Router is based on the file system, where folders define routes.

### Key Files and Folders

- `src/app/`: The root of your application
- `src/app/layout.tsx`: The root layout (applies to all routes)
- `src/app/page.tsx`: The home page component
- `src/app/[route]/page.tsx`: Page component for a specific route
- `src/app/[route]/layout.tsx`: Layout for a specific route

### Special Files

- `page.tsx`: Defines a UI that is unique to a route
- `layout.tsx`: Defines UI that is shared between multiple pages
- `loading.tsx`: Creates a loading UI for a specific route
- `error.tsx`: Creates an error UI for a specific route
- `not-found.tsx`: Creates a UI for 404 errors

## Client vs Server Components

Next.js 13+ uses React Server Components by default. This means that components are rendered on the server by default, which can improve performance and reduce the amount of JavaScript sent to the client.

### Server Components

Server Components are the default in the App Router. They:

- Run on the server only
- Can access server resources directly (databases, file system, etc.)
- Don't include client-side interactivity
- Don't have access to browser APIs
- Don't have access to React hooks like `useState`, `useEffect`, etc.

Example of a Server Component:

```tsx
// This is a Server Component by default
export default function ServerComponent() {
  return <div>This component runs on the server</div>;
}
```

### Client Components

Client Components are components that include client-side interactivity. They:

- Run on both the server (for initial render) and the client
- Can use React hooks like `useState`, `useEffect`, etc.
- Can access browser APIs
- Can handle user interactions

To mark a component as a Client Component, add the `'use client'` directive at the top of the file:

```tsx
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### When to Use Each

- Use Server Components by default
- Use Client Components when you need:
  - Interactivity and event listeners (`onClick`, `onChange`, etc.)
  - React hooks (`useState`, `useEffect`, etc.)
  - Browser-only APIs
  - Custom hooks that depend on state, effects, or browser APIs

## Data Fetching Patterns

Next.js provides several ways to fetch data in your application.

### Server Components Data Fetching

In Server Components, you can fetch data directly without using hooks:

```tsx
// app/page.tsx
async function getData() {
  const res = await fetch('https://api.example.com/data');
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return res.json();
}

export default async function Page() {
  const data = await getData();
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
}
```

### Client Components Data Fetching

In Client Components, you can use hooks like `useState` and `useEffect` to fetch data:

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('https://api.example.com/data');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
}
```

### SWR for Data Fetching

For client-side data fetching with caching, revalidation, and more, you can use the SWR library:

```tsx
'use client';

import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ClientComponent() {
  const { data, error, isLoading } = useSWR('/api/data', fetcher);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
}
```

## Routing and Navigation

### Creating Routes

In the App Router, routes are defined by folders. For example:

- `src/app/page.tsx` → `/`
- `src/app/about/page.tsx` → `/about`
- `src/app/blog/[slug]/page.tsx` → `/blog/:slug`

### Dynamic Routes

Dynamic routes are created by using square brackets in the folder name:

```
src/app/blog/[slug]/page.tsx
```

You can access the dynamic parameter in the component:

```tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <div>Blog Post: {params.slug}</div>;
}
```

### Linking Between Pages

Use the `Link` component from `next/link` to navigate between pages:

```tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/blog/hello-world">Blog Post</Link>
        </li>
      </ul>
    </nav>
  );
}
```

### Programmatic Navigation

Use the `useRouter` hook from `next/navigation` for programmatic navigation:

```tsx
'use client';

import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle login logic
    
    // Navigate to dashboard after successful login
    router.push('/dashboard');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Login</button>
    </form>
  );
}
```

## Form Handling

### Basic Form with React State

```tsx
'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Form Validation

```tsx
'use client';

import { useState } from 'react';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      valid = false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form data:', formData);
      // Handle form submission
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <p className="error">{errors.username}</p>}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <p className="error">{errors.password}</p>}
      </div>
      
      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
      </div>
      
      <button type="submit">Register</button>
    </form>
  );
}
```

### Form with React Hook Form

React Hook Form is a popular library for form handling in React. It provides a more efficient way to handle forms with less code and better performance.

First, install React Hook Form:

```bash
npm install react-hook-form
```

Then, use it in your component:

```tsx
'use client';

import { useForm } from 'react-hook-form';

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const onSubmit = (data) => {
    console.log('Form data:', data);
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Email is invalid',
            },
          })}
        />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>
      
      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          {...register('message', { required: 'Message is required' })}
        />
        {errors.message && <p className="error">{errors.message.message}</p>}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Metadata and SEO

Next.js provides a way to add metadata to your pages for SEO purposes.

### Static Metadata

```tsx
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home Page',
  description: 'Welcome to our website',
};

export default function Home() {
  return <div>Home Page</div>;
}
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default function BlogPost({ params }) {
  // ...
}
```

## Error Handling

### Error Boundary

Create an `error.tsx` file in a route segment to handle errors:

```tsx
// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Not Found Page

Create a `not-found.tsx` file to handle 404 errors:

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}
```

## Loading States

Create a `loading.tsx` file to show a loading state while a page is loading:

```tsx
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

## Environment Variables

Next.js supports environment variables out of the box:

- `.env.local`: Local environment variables (not committed to git)
- `.env.development`: Development environment variables
- `.env.production`: Production environment variables

To access environment variables in your code:

```tsx
// Server Component
console.log(process.env.DATABASE_URL);

// Client Component
console.log(process.env.NEXT_PUBLIC_API_URL);
```

Note that only environment variables prefixed with `NEXT_PUBLIC_` are available in the browser.

---
title: State Management and Data Flow
description: Complete guide to client-side state management, data fetching, and state patterns in the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# State Management and Data Flow

## Overview

The Brain Log App implements a layered state management approach combining React's Context API, custom hooks, and local component state. The architecture prioritizes simplicity, type safety, and Edge Runtime compatibility while providing robust authentication, theme management, and data synchronization patterns.

## State Management Architecture

### Design Principles

- **Layered Architecture**: Different state concerns are managed at appropriate levels
- **Context for Global State**: Authentication and theme state shared across components
- **Local State for UI**: Component-specific state managed locally
- **Type Safety**: Full TypeScript integration for state definitions
- **Edge Compatibility**: All patterns work with Vercel Edge Runtime
- **Performance**: Optimized rendering and minimal state updates

### State Layers

1. **Global Context State**: Authentication, theme, session management
2. **Component State**: Form data, UI interactions, loading states
3. **Custom Hooks**: Specialized state logic and side effects
4. **Server State**: API data fetching and caching patterns

## Global State Management

### AuthContext - Authentication State

**Purpose**: Centralized authentication state management with session handling

**Location**: `src/lib/auth/AuthContext.tsx`

**State Shape**:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: UserRegistrationData) => Promise<boolean>;
  updateUserTimezone: (timezone: string) => Promise<boolean>;
  refreshSession: (forceReload?: boolean) => Promise<boolean>;
  sessionExpired: boolean;
}

interface User {
  id: number;
  username: string;
  displayName: string;
  theme?: string;
  timezone: string;
}
```

**Usage Pattern**:
```typescript
import { useAuth } from '@/lib/auth/AuthContext';

function ProfileComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.displayName}</h1>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

**Key Features**:
- **Session Management**: Automatic session refresh and expiration detection
- **Activity Tracking**: User activity monitoring for session timeout
- **Error Handling**: Graceful handling of authentication failures
- **NextAuth Integration**: Seamless integration with NextAuth.js v5
- **Edge Runtime Support**: Compatible with Vercel Edge Runtime

**Session Refresh Pattern**:
```typescript
const refreshSession = useCallback(async (forceReload = false): Promise<boolean> => {
  try {
    if (!session) return false;
    
    const updatedSession = await updateSession();
    
    if (updatedSession) {
      setSessionExpired(false);
      
      if (forceReload && typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Session refresh error:', error);
    return false;
  }
}, [session, updateSession]);
```

### ThemeProvider - Theme State Management

**Purpose**: Global theme state with system preference detection

**Location**: `src/lib/utils/ThemeProvider.tsx`

**Implementation**:
```typescript
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export { useTheme } from "next-themes";
```

**Usage Pattern**:
```typescript
import { useTheme } from '@/lib/utils/ThemeProvider';

function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Current: {theme} (System: {systemTheme})
    </button>
  );
}
```

**Hydration-Safe Theme Usage**:
```typescript
import { useHasMounted } from '@/lib/utils/ThemeProvider';

function ThemeAwareComponent() {
  const hasMounted = useHasMounted();
  const { theme } = useTheme();
  
  if (!hasMounted) {
    return <div>Loading...</div>; // Prevent hydration mismatch
  }
  
  return <div>Current theme: {theme}</div>;
}
```

## Provider Composition Pattern

### ClientProviders Structure

**Purpose**: Compose all global providers in correct order

**Location**: `src/components/providers/ClientProviders.tsx`

**Implementation**:
```typescript
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider refetchOnWindowFocus={true}>
        <AuthProvider>
          {children}
          <SessionExpiredAlert />
          <Toaster />
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
```

**Provider Hierarchy**:
1. **ThemeProvider**: Outermost - provides theme context
2. **SessionProvider**: NextAuth session management
3. **AuthProvider**: Application authentication logic
4. **Global Components**: Session alerts, notifications

**Usage in Layout**:
```typescript
export function Layout({ children }: LayoutProps) {
  return (
    <ClientProviders>
      <div className="min-h-screen bg-background">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </ClientProviders>
  );
}
```

## Custom Hooks

### useRefreshCleanup Hook

**Purpose**: Handle page refresh parameter cleanup

**Location**: `src/lib/hooks/useRefreshCleanup.ts`

**Implementation**:
```typescript
export function useRefreshCleanup(): boolean {
  const refreshed = wasRefreshed();
  
  useEffect(() => {
    if (refreshed) {
      cleanRefreshParam();
    }
  }, [refreshed]);
  
  return refreshed;
}
```

**Usage Pattern**:
```typescript
function Dashboard() {
  const wasRefreshed = useRefreshCleanup();
  
  useEffect(() => {
    if (wasRefreshed) {
      // Handle post-refresh logic
      console.log('Page was refreshed');
    }
  }, [wasRefreshed]);
  
  return <div>Dashboard content</div>;
}
```

### useHasMounted Hook

**Purpose**: Prevent hydration mismatches for client-only features

**Implementation**:
```typescript
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
}
```

**Usage Pattern**:
```typescript
function ClientOnlyComponent() {
  const hasMounted = useHasMounted();
  
  if (!hasMounted) {
    return <div>Loading...</div>;
  }
  
  // Safe to use window, localStorage, etc.
  return <div>Client-side content</div>;
}
```

## Component State Patterns

### Local State Management

**Form State Pattern**:
```typescript
function FormComponent({ initialValues, onSubmit }: FormProps) {
  const [formData, setFormData] = useState(initialValues || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors(['Submission failed']);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {errors.length > 0 && <ErrorDisplay errors={errors} />}
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

**Loading State Pattern**:
```typescript
function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await api.getData();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Render data */}</div>;
}
```

### State Reducer Pattern

**For Complex State Logic**:
```typescript
interface AppState {
  currentStep: number;
  formData: Record<string, any>;
  isSubmitting: boolean;
  errors: string[];
}

type AppAction =
  | { type: 'NEXT_STEP'; payload: any }
  | { type: 'PREV_STEP' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string[] };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: state.currentStep + 1,
        formData: { ...state.formData, ...action.payload },
        errors: [],
      };
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
        errors: [],
      };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, errors: [] };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, errors: action.payload };
    default:
      return state;
  }
}

function MultiStepForm() {
  const [state, dispatch] = useReducer(appReducer, {
    currentStep: 0,
    formData: {},
    isSubmitting: false,
    errors: [],
  });
  
  const handleNext = (stepData: any) => {
    dispatch({ type: 'NEXT_STEP', payload: stepData });
  };
  
  return (
    <div>
      {/* Render current step based on state.currentStep */}
    </div>
  );
}
```

## Data Fetching Patterns

### API Service Integration

**Service Layer Pattern**:
```typescript
// src/lib/services/api.ts
class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async getDailyLogs(userId: number) {
    return this.request<DailyLog[]>(`/daily-logs?userId=${userId}`);
  }
  
  async createDailyLog(data: CreateDailyLogData) {
    return this.request<DailyLog>('/daily-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
```

**Custom Data Fetching Hook**:
```typescript
function useApiData<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.request<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);
  
  return { data, loading, error, refetch: fetchData };
}

// Usage
function DailyLogsComponent({ userId }: { userId: number }) {
  const { data: logs, loading, error, refetch } = useApiData<DailyLog[]>(
    `/daily-logs?userId=${userId}`,
    [userId]
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {logs?.map(log => <LogItem key={log.id} log={log} />)}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Optimistic Updates

**Pattern for Immediate UI Feedback**:
```typescript
function useOptimisticUpdate<T>(
  items: T[],
  updateFn: (id: string, updates: Partial<T>) => Promise<T>
) {
  const [optimisticItems, setOptimisticItems] = useState(items);
  
  const updateItem = async (id: string, updates: Partial<T>) => {
    // Optimistic update
    setOptimisticItems(current =>
      current.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
    
    try {
      // Actual API call
      const updatedItem = await updateFn(id, updates);
      
      // Update with server response
      setOptimisticItems(current =>
        current.map(item =>
          item.id === id ? updatedItem : item
        )
      );
    } catch (error) {
      // Revert optimistic update
      setOptimisticItems(items);
      throw error;
    }
  };
  
  return { items: optimisticItems, updateItem };
}
```

## State Synchronization

### Cross-Component Communication

**Event-Based Updates**:
```typescript
// Custom event system for loose coupling
class EventBus {
  private listeners: Map<string, Function[]> = new Map();
  
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }
  
  emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventBus();

// Usage in components
function ComponentA() {
  const handleUpdate = () => {
    eventBus.emit('data-updated', { id: 1, data: {} });
  };
  
  return <button onClick={handleUpdate}>Update</button>;
}

function ComponentB() {
  const [lastUpdate, setLastUpdate] = useState(null);
  
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('data-updated', (data) => {
      setLastUpdate(data);
    });
    
    return unsubscribe;
  }, []);
  
  return <div>Last update: {lastUpdate?.id}</div>;
}
```

### Context State Updates

**Context with Update Methods**:
```typescript
interface AppContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

function AppProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
    };
    
    setNotifications(current => [...current, newNotification]);
    
    // Auto-remove after timeout
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  }, []);
  
  const removeNotification = useCallback((id: string) => {
    setNotifications(current => current.filter(n => n.id !== id));
  }, []);
  
  const value = {
    notifications,
    addNotification,
    removeNotification,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
```

## Performance Optimization

### Memoization Patterns

**Component Memoization**:
```typescript
const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data,
  onUpdate,
}: {
  data: ComplexData;
  onUpdate: (id: string) => void;
}) {
  // Expensive rendering logic
  return <div>{/* Complex UI */}</div>;
});

// Usage with memoized callbacks
function ParentComponent() {
  const [data, setData] = useState<ComplexData[]>([]);
  
  const handleUpdate = useCallback((id: string) => {
    setData(current => current.map(item =>
      item.id === id ? { ...item, updated: true } : item
    ));
  }, []);
  
  return (
    <div>
      {data.map(item => (
        <ExpensiveComponent
          key={item.id}
          data={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
```

**State Selectors**:
```typescript
// Context with selector pattern
function useAppSelector<T>(selector: (state: AppState) => T): T {
  const state = useContext(AppContext);
  return useMemo(() => selector(state), [state, selector]);
}

// Usage
function ComponentThatNeedsUsername() {
  const username = useAppSelector(state => state.user?.username);
  return <div>Username: {username}</div>;
}
```

### Debounced State Updates

**Input Debouncing**:
```typescript
function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage in search component
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounced(searchTerm, 300);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## Error Handling

### Error Boundaries

**Component Error Boundary**:
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            {this.state.error?.message}
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MainContent />
    </ErrorBoundary>
  );
}
```

### Global Error State

**Error Context Pattern**:
```typescript
interface ErrorContextType {
  errors: AppError[];
  addError: (error: AppError) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<AppError[]>([]);
  
  const addError = useCallback((error: AppError) => {
    const errorWithId = {
      ...error,
      id: Date.now().toString(),
    };
    
    setErrors(current => [...current, errorWithId]);
  }, []);
  
  const removeError = useCallback((id: string) => {
    setErrors(current => current.filter(e => e.id !== id));
  }, []);
  
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);
  
  return (
    <ErrorContext.Provider value={{
      errors,
      addError,
      removeError,
      clearErrors,
    }}>
      {children}
      <ErrorDisplay errors={errors} onDismiss={removeError} />
    </ErrorContext.Provider>
  );
}
```

## Best Practices

### State Organization

1. **Keep Related State Together**: Group related state variables
2. **Use Custom Hooks**: Extract stateful logic into reusable hooks
3. **Minimize Context State**: Only put truly global state in context
4. **Local State First**: Start with local state, lift up when necessary
5. **Type Everything**: Use TypeScript for all state definitions

### Performance Guidelines

1. **Memoize Callbacks**: Use `useCallback` for function props
2. **Memoize Expensive Computations**: Use `useMemo` for calculations
3. **Split Contexts**: Separate contexts for different concerns
4. **Optimize Re-renders**: Use `React.memo` for pure components
5. **Debounce Updates**: Debounce frequent state updates

### Error Handling

1. **Graceful Degradation**: Provide fallbacks for failed states
2. **User-Friendly Messages**: Show clear error messages
3. **Error Boundaries**: Wrap components in error boundaries
4. **Retry Mechanisms**: Implement retry logic for failed requests
5. **Logging**: Log errors for debugging and monitoring

## Troubleshooting

### Common Issues

#### Context Not Found Error
**Problem**: `useContext` hook used outside provider

**Solution**: Ensure component is wrapped in provider
```typescript
// Add error check in custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### Stale Closure Issues
**Problem**: Event handlers capture old state values

**Solution**: Use functional state updates
```typescript
// ❌ Stale closure
const handleClick = () => {
  setTimeout(() => {
    setCount(count + 1); // Uses old count value
  }, 1000);
};

// ✅ Functional update
const handleClick = () => {
  setTimeout(() => {
    setCount(current => current + 1); // Uses current value
  }, 1000);
};
```

#### Hydration Mismatches
**Problem**: Server and client render different content

**Solution**: Use hydration-safe patterns
```typescript
function ClientOnlyComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div>Loading...</div>;
  }
  
  return <div>{/* Client-only content */}</div>;
}
```

## Related Documents

- [01-components.md](./01-components.md) - Component patterns and usage
- [02-theming.md](./02-theming.md) - Theme state management
- [03-forms.md](./03-forms.md) - Form state patterns
- [../02-architecture/02-frontend.md](../02-architecture/02-frontend.md) - Frontend architecture
- [../02-architecture/05-authentication.md](../02-architecture/05-authentication.md) - Authentication system

## Changelog

### 2025-07-06 - v1.0.0
- Initial documentation creation
- Complete state management patterns
- Context API implementation guide
- Custom hooks and performance optimization
- Error handling and troubleshooting
- Best practices and guidelines

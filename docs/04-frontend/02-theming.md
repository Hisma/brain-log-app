---
title: Theming and Design System
description: Complete guide to the design system, theming implementation, and styling guidelines for the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Theming and Design System

## Overview

The Brain Log App implements a comprehensive design system built on Tailwind CSS with extensive customization, featuring a modern color system using OKLCH color space, seamless dark/light mode switching, and consistent styling patterns throughout the application.

## Design System Architecture

### Core Technologies

- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **next-themes**: Theme switching and persistence
- **OKLCH Color Space**: Modern color system for better perceptual uniformity
- **CSS Custom Properties**: Theme-aware color system
- **class-variance-authority (cva)**: Component variant management

### Design Principles

- **Consistency**: Unified color palette and spacing system
- **Accessibility**: High contrast ratios and semantic color usage
- **Responsiveness**: Mobile-first responsive design
- **Performance**: Optimized CSS with minimal runtime overhead
- **Maintainability**: Centralized theming with clear conventions

## Color System

### Color Palette

The application uses a sophisticated color system based on OKLCH color space for better perceptual uniformity and accessibility.

#### Light Theme Colors (`:root`)

```css
:root {
  /* Base Colors */
  --background: oklch(1 0 0);              /* Pure white */
  --foreground: oklch(0.145 0 0);          /* Near black */
  
  /* Surface Colors */
  --card: oklch(1 0 0);                    /* White */
  --card-foreground: oklch(0.145 0 0);     /* Near black */
  --popover: oklch(1 0 0);                 /* White */
  --popover-foreground: oklch(0.145 0 0);  /* Near black */
  
  /* Brand Colors */
  --primary: oklch(0.205 0 0);             /* Dark gray */
  --primary-foreground: oklch(0.985 0 0);  /* Off white */
  
  /* Interactive Colors */
  --secondary: oklch(0.97 0 0);            /* Light gray */
  --secondary-foreground: oklch(0.205 0 0); /* Dark gray */
  --muted: oklch(0.97 0 0);                /* Light gray */
  --muted-foreground: oklch(0.556 0 0);    /* Medium gray */
  --accent: oklch(0.97 0 0);               /* Light gray */
  --accent-foreground: oklch(0.205 0 0);   /* Dark gray */
  
  /* System Colors */
  --destructive: oklch(0.577 0.245 27.325); /* Red */
  --border: oklch(0.922 0 0);              /* Very light gray */
  --input: oklch(0.922 0 0);               /* Very light gray */
  --ring: oklch(0.708 0 0);                /* Medium gray */
}
```

#### Dark Theme Colors (`.dark`)

```css
.dark {
  /* Base Colors */
  --background: oklch(0.145 0 0);          /* Near black */
  --foreground: oklch(0.985 0 0);          /* Off white */
  
  /* Surface Colors */
  --card: oklch(0.205 0 0);                /* Dark gray */
  --card-foreground: oklch(0.985 0 0);     /* Off white */
  --popover: oklch(0.205 0 0);             /* Dark gray */
  --popover-foreground: oklch(0.985 0 0);  /* Off white */
  
  /* Brand Colors */
  --primary: oklch(0.922 0 0);             /* Light gray */
  --primary-foreground: oklch(0.205 0 0);  /* Dark gray */
  
  /* Interactive Colors */
  --secondary: oklch(0.269 0 0);           /* Medium dark gray */
  --secondary-foreground: oklch(0.985 0 0); /* Off white */
  --muted: oklch(0.269 0 0);               /* Medium dark gray */
  --muted-foreground: oklch(0.708 0 0);    /* Medium gray */
  --accent: oklch(0.269 0 0);              /* Medium dark gray */
  --accent-foreground: oklch(0.985 0 0);   /* Off white */
  
  /* System Colors */
  --destructive: oklch(0.704 0.191 22.216); /* Red (adjusted for dark) */
  --border: oklch(1 0 0 / 10%);            /* Translucent white */
  --input: oklch(1 0 0 / 15%);             /* Translucent white */
  --ring: oklch(0.556 0 0);                /* Medium gray */
}
```

### Chart Colors

Specialized color palette for data visualization:

```css
/* Light Theme Charts */
--chart-1: oklch(0.646 0.222 41.116);  /* Orange */
--chart-2: oklch(0.6 0.118 184.704);   /* Blue */
--chart-3: oklch(0.398 0.07 227.392);  /* Purple */
--chart-4: oklch(0.828 0.189 84.429);  /* Green */
--chart-5: oklch(0.769 0.188 70.08);   /* Yellow */

/* Dark Theme Charts */
--chart-1: oklch(0.488 0.243 264.376); /* Purple */
--chart-2: oklch(0.696 0.17 162.48);   /* Teal */
--chart-3: oklch(0.769 0.188 70.08);   /* Yellow */
--chart-4: oklch(0.627 0.265 303.9);   /* Pink */
--chart-5: oklch(0.645 0.246 16.439);  /* Orange */
```

### Semantic Color Usage

Colors are mapped to semantic purposes:

- **Primary**: Main brand color for buttons and key actions
- **Secondary**: Supporting actions and subtle backgrounds
- **Muted**: Disabled states and subtle text
- **Accent**: Hover states and highlights
- **Destructive**: Error states and dangerous actions
- **Border**: Dividers and component boundaries
- **Ring**: Focus indicators and active states

## Theme Implementation

### ThemeProvider Configuration

The theme system is implemented using next-themes with custom configuration:

```typescript
// src/lib/utils/ThemeProvider.tsx
<NextThemesProvider
  attribute="class"        // Use CSS classes for theme switching
  defaultTheme="system"    // Follow system preference by default
  enableSystem            // Enable system theme detection
  disableTransitionOnChange // Prevent flash during theme change
>
  {children}
</NextThemesProvider>
```

### Theme Hook Usage

```typescript
import { useTheme } from "next-themes";

function ThemeAwareComponent() {
  const { theme, setTheme, systemTheme } = useTheme();
  
  return (
    <div>
      Current theme: {theme}
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle theme
      </button>
    </div>
  );
}
```

### Safe Theme Usage

For components that need theme information during hydration:

```typescript
import { useHasMounted } from '@/lib/utils/ThemeProvider';

function ThemeAwareComponent() {
  const hasMounted = useHasMounted();
  const { theme } = useTheme();
  
  if (!hasMounted) {
    return <div>Loading...</div>; // Prevent hydration mismatch
  }
  
  return <div>Theme: {theme}</div>;
}
```

### Theme Toggle Component

The application includes a sophisticated theme toggle:

```typescript
// src/components/ui/modetoggle.tsx
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Tailwind Configuration

### Extended Theme Configuration

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS custom property mapping
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        // ... all other color variables
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
```

### Custom Radius System

The application uses a dynamic radius system:

```css
:root {
  --radius: 0.625rem; /* Base radius (10px) */
}

/* Computed radius values */
--radius-sm: calc(var(--radius) - 4px);  /* 6px */
--radius-md: calc(var(--radius) - 2px);  /* 8px */
--radius-lg: var(--radius);              /* 10px */
--radius-xl: calc(var(--radius) + 4px);  /* 14px */
```

## Typography System

### Font Configuration

The application uses a carefully selected font stack:

```css
font-family: {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  serif: ['ui-serif', 'Georgia', 'serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
}
```

**Inter Font Features**:
- Optimized for screen reading
- Excellent character recognition
- Wide language support
- Variable font technology

### Typography Scale

The application follows Tailwind's default typography scale with consistent line heights and letter spacing.

## Component Styling Patterns

### Variant-Based Styling

Components use class-variance-authority (cva) for variant management:

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  // Base styles
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
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Focus and Interaction States

Consistent focus and interaction patterns:

```css
/* Focus styles */
outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]

/* Error states */
aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive

/* Hover transitions */
transition-all hover:bg-primary/90
```

### Responsive Design Patterns

The application follows mobile-first responsive design:

```css
/* Mobile-first utilities */
@apply px-4 md:px-6 lg:px-8
@apply text-sm md:text-base lg:text-lg
@apply space-y-2 md:space-y-4 lg:space-y-6
```

## Animation System

### Custom Animations

```css
@keyframes fadeIn {
  '0%': { opacity: '0' },
  '100%': { opacity: '1' },
}

@keyframes slideUp {
  '0%': { transform: 'translateY(20px)', opacity: '0' },
  '100%': { transform: 'translateY(0)', opacity: '1' },
}
```

### Animation Usage

```typescript
// Component with animations
<div className="animate-fade-in">
  Content appears with fade effect
</div>

<div className="animate-slide-up">
  Content slides up from bottom
</div>
```

### Transition Patterns

Consistent transition timing throughout the application:

```css
transition-all /* Covers all properties */
transition-colors /* For color changes */
transition-transform /* For transforms */
```

## Layout and Spacing

### Container System

```css
/* Main container */
.container {
  @apply mx-auto px-4 py-8;
}

/* Responsive containers */
@apply max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl
```

### Spacing Scale

Consistent spacing using Tailwind's scale:

```css
/* Common spacing patterns */
space-y-2  /* 8px vertical spacing */
space-y-4  /* 16px vertical spacing */
space-y-6  /* 24px vertical spacing */
space-y-8  /* 32px vertical spacing */

gap-2      /* 8px gap in flex/grid */
gap-4      /* 16px gap in flex/grid */
gap-6      /* 24px gap in flex/grid */
```

## Best Practices

### Theme-Aware Development

1. **Use Semantic Colors**: Always use semantic color variables, never hardcoded colors
2. **Test Both Themes**: Verify components work in both light and dark modes
3. **Consistent Patterns**: Follow established patterns for hover states and interactions
4. **Accessibility**: Maintain proper contrast ratios in both themes

### CSS Custom Properties

```css
/* ✅ Good - Using semantic variables */
background-color: var(--card);
color: var(--card-foreground);

/* ❌ Bad - Hardcoded colors */
background-color: #ffffff;
color: #000000;
```

### Component Styling

```typescript
// ✅ Good - Theme-aware classes
<div className="bg-card text-card-foreground border border-border">

// ❌ Bad - Fixed colors
<div className="bg-white text-black border-gray-200">
```

### Performance Considerations

1. **CSS Variables**: Minimal runtime overhead
2. **Tailwind Purging**: Only used classes are included in production
3. **Theme Persistence**: next-themes handles localStorage automatically
4. **Hydration**: Use `useHasMounted` to prevent theme mismatches

## Troubleshooting

### Common Issues

#### Theme Flash on Load
**Problem**: Brief flash of wrong theme during initial load

**Solution**: Use `useHasMounted` hook and show loading state
```typescript
const hasMounted = useHasMounted();
if (!hasMounted) return <div>Loading...</div>;
```

#### Colors Not Updating
**Problem**: Custom CSS not updating with theme changes

**Solution**: Ensure CSS uses custom properties, not hardcoded values
```css
/* ✅ Updates with theme */
color: var(--foreground);

/* ❌ Doesn't update */
color: #000000;
```

#### Focus Styles Not Visible
**Problem**: Focus indicators not showing properly

**Solution**: Use consistent focus patterns
```css
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

## Related Documents

- [01-components.md](./01-components.md) - Component library reference
- [03-forms.md](./03-forms.md) - Form component styling
- [04-state-management.md](./04-state-management.md) - Theme state management
- [../02-architecture/02-frontend.md](../02-architecture/02-frontend.md) - Frontend architecture

## Changelog

### 2025-07-06 - v1.0.0
- Initial documentation creation
- Complete color system reference
- Theme implementation guide
- Styling patterns and best practices
- Animation and transition system
- Troubleshooting guide

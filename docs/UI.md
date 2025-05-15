# Brain Log App - UI Documentation

This document provides comprehensive documentation for the UI components and theming system in the Brain Log App.

## UI Architecture Overview

The Brain Log App uses a modern UI architecture with the following key components:

1. **Next.js**: React framework for server-side rendering and static site generation
2. **Tailwind CSS**: Utility-first CSS framework for styling
3. **shadcn/ui**: Component collection built on Radix UI primitives and Tailwind CSS
4. **Lucide**: Icon library for consistent iconography

## shadcn/ui Integration

[shadcn/ui](https://ui.shadcn.com/) is not a traditional component library but rather a collection of reusable components built on top of Tailwind CSS and Radix UI primitives. It provides a set of accessible, customizable components that can be copied and pasted into your project.

### Configuration

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

Key configuration options:

- **Style**: "new-york" - The visual style of the components
- **RSC**: true - Support for React Server Components
- **TSX**: true - Using TypeScript with JSX
- **Base Color**: neutral - The base color for the theme
- **CSS Variables**: true - Using CSS variables for theming
- **Icon Library**: lucide - The icon library used in the components

### Component Structure

shadcn/ui components are located in the `src/components/ui` directory. Each component follows a similar structure:

1. Import necessary dependencies
2. Define component variants using class-variance-authority (cva)
3. Create the component with TypeScript props
4. Export the component and its variants

Example of a Button component:

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
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
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

## Theming System

The Brain Log App uses a theming system based on CSS variables, defined in `src/styles/globals.css`. This allows for easy customization of colors, spacing, and other design tokens.

### Theme Variables

The theme variables are defined as CSS custom properties (variables) using the HSL color format:

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

### Dark Mode

The application supports dark mode using the `.dark` class on the `html` element. The theme is toggled using the `ThemeProvider` component, which manages the theme state and applies the appropriate class.

### Using Theme Variables

Theme variables are used throughout the application using the `hsl()` function in Tailwind CSS:

```tsx
<div className="bg-background text-foreground">
  <h1 className="text-primary">Hello World</h1>
  <p className="text-muted-foreground">This is a paragraph</p>
</div>
```

## UI Components

The Brain Log App includes a variety of UI components from shadcn/ui. Here are some of the key components used in the application:

### Layout Components

- **Card**: Container for content with a border and background
- **Sheet**: Slide-in panel for additional content
- **Tabs**: Tabbed interface for organizing content
- **Dialog**: Modal dialog for displaying content or forms

### Form Components

- **Button**: Interactive button element with various styles
- **Input**: Text input field
- **Select**: Dropdown selection field
- **Checkbox**: Checkbox input for boolean values
- **RadioGroup**: Group of radio buttons for selecting one option
- **Switch**: Toggle switch for boolean values
- **Slider**: Range input for selecting a value from a range
- **Textarea**: Multi-line text input field
- **DatePicker**: Date selection component

### Data Display Components

- **Table**: Tabular data display
- **Avatar**: User avatar display
- **Badge**: Small status indicator
- **Progress**: Progress indicator
- **Skeleton**: Loading placeholder

### Navigation Components

- **Breadcrumb**: Navigation breadcrumb trail
- **Pagination**: Page navigation controls
- **Dropdown Menu**: Menu that appears on click or hover
- **Navigation Menu**: Horizontal navigation menu

### Feedback Components

- **Alert**: Contextual feedback message
- **Toast**: Brief notification message
- **Tooltip**: Information that appears on hover

## Adding New Components

To add a new shadcn/ui component to the project:

1. Use the shadcn/ui CLI:

```bash
npx shadcn-ui@latest add [component-name]
```

For example, to add the Dialog component:

```bash
npx shadcn-ui@latest add dialog
```

2. This will add the component to the `src/components/ui` directory.

3. Import and use the component in your application:

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog Description</DialogDescription>
        </DialogHeader>
        <p>Dialog content goes here</p>
      </DialogContent>
    </Dialog>
  );
}
```

## Customizing Components

One of the key benefits of shadcn/ui is that components are part of your project and can be customized:

1. Modify the component file directly in `src/components/ui`.
2. Update the styling using Tailwind CSS classes.
3. Add new variants or properties as needed.

Example of customizing the Button component:

```tsx
// Add a new variant
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        // ... other variants
        
        // Add a new custom variant
        custom: "bg-purple-600 text-white hover:bg-purple-700",
      },
      // ... other variant groups
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Tailwind CSS Configuration

The Tailwind CSS configuration is defined in `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        // ... keyframe definitions
      },
      animation: {
        // ... animation definitions
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

## Best Practices

### Component Usage

1. **Use Existing Components**: Before creating a new component, check if shadcn/ui already provides one that meets your needs.

2. **Consistent Styling**: Follow the established design patterns and styling conventions.

3. **Accessibility**: shadcn/ui components are built with accessibility in mind. Maintain this by:
   - Using proper ARIA attributes
   - Ensuring keyboard navigation works
   - Maintaining sufficient color contrast

4. **Component Composition**: Compose complex UI elements from simpler shadcn/ui components.

5. **Theme Consistency**: Use the theme variables instead of hardcoded colors.

### Custom Components

When creating custom components:

1. **Follow shadcn/ui Patterns**: Use the same patterns and conventions as shadcn/ui components.

2. **Use Theme Variables**: Use the theme variables for colors and other design tokens.

3. **Accessibility**: Ensure your components are accessible.

4. **Responsive Design**: Make your components responsive using Tailwind CSS utilities.

5. **TypeScript**: Use TypeScript for type safety.

### Form Handling

When working with form components:

1. **Form Validation**: Use a form validation library like Zod or Yup.

2. **Error Handling**: Display clear error messages for form validation errors.

3. **Loading States**: Show loading states during form submission.

4. **Accessibility**: Ensure forms are accessible with proper labels and error messages.

## Examples

### Basic Form

```tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/Button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form"
import { Input } from "@/components/ui/Input"

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
})

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormDescription>
                Your email address will not be shared.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Card Component

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export function DailyLogCard({ log }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{new Date(log.date).toLocaleDateString()}</CardTitle>
        <CardDescription>Daily Log</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Morning Mood:</span>
            <span>{log.morningMood}/10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Focus Level:</span>
            <span>{log.focusLevel}/10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Energy Level:</span>
            <span>{log.energyLevel}/10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overall Mood:</span>
            <span>{log.overallMood}/10</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  )
}
```

### Dialog Component

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"

export function DeleteConfirmationDialog({ onDelete }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [class-variance-authority Documentation](https://cva.style/docs)
- [Lucide Icons](https://lucide.dev/)

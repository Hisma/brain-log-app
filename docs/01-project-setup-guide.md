# Project Setup Guide

This guide provides instructions for setting up the Brain Log App project with Next.js, TypeScript, Tailwind CSS, and Dexie.js.

## Prerequisites

- Node.js (v18.17.0 or later)
- npm or yarn or pnpm

## Creating a Next.js Project with TypeScript

```bash
# Using npm
npx create-next-app@latest brain-log-app
# Using yarn
yarn create next-app brain-log-app
# Using pnpm
pnpm create next-app brain-log-app
```

During the setup, you'll be prompted with several options:

```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias? … No
```

## Project Structure

After setup, your project structure should look like this:

```
brain-log-app/
├── node_modules/
├── public/
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   └── lib/
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Installing Dexie.js

```bash
# Using npm
npm install dexie dexie-react-hooks
# Using yarn
yarn add dexie dexie-react-hooks
# Using pnpm
pnpm add dexie dexie-react-hooks
```

## Setting Up Dexie.js

Create a database configuration file:

```bash
mkdir -p src/lib/db
touch src/lib/db/db.ts
```

Add the following code to `src/lib/db/db.ts`:

```typescript
import Dexie, { Table } from 'dexie';

// Define interfaces for our data models
export interface MorningCheckIn {
  sleepHours: number;
  sleepQuality: number;
  dreams: string;
  morningMood: number;
  physicalStatus: string;
}

export interface MedicationRoutine {
  taken: boolean;
  timeOfDay: string;
  dose: number;
  ateWithinHour: boolean;
  firstHourFeeling: string;
}

export interface MiddaySnapshot {
  focus: number;
  energy: number;
  ruminationLevel: number;
  mainTrigger: string;
  response: string[];
}

export interface AfternoonCheckpoint {
  triggerInteraction: boolean;
  triggerDescription: string;
  selfWorthTiedToPerformance: string;
  overextended: string;
}

export interface EndOfDayReflection {
  overallMood: number;
  concertaPositive: string;
  helpedMost: string;
  pulledOffTrack: string;
  thoughtForTomorrow: string;
}

export interface DailyLog {
  id?: number;
  date: Date;
  morningCheckIn: MorningCheckIn;
  medicationRoutine: MedicationRoutine;
  middaySnapshot: MiddaySnapshot;
  afternoonCheckpoint: AfternoonCheckpoint;
  endOfDayReflection: EndOfDayReflection;
}

export interface WeeklyCheckIn {
  id?: number;
  weekStartDate: Date;
  averageRumination: number;
  stableDays: number;
  concertaWorkingDays: number;
  questionedLeavingJob: boolean;
  insight: string;
}

// Define the database
class BrainLogDB extends Dexie {
  dailyLogs!: Table<DailyLog, number>;
  weeklyCheckIns!: Table<WeeklyCheckIn, number>;

  constructor() {
    super('BrainLogDB');
    this.version(1).stores({
      dailyLogs: '++id, date',
      weeklyCheckIns: '++id, weekStartDate'
    });
  }
}

export const db = new BrainLogDB();
```

## Configuring Tailwind CSS

Tailwind CSS should already be configured if you selected it during the Next.js setup. The configuration files are:

- `tailwind.config.js`: Configure theme, plugins, and other Tailwind settings
- `postcss.config.js`: Configure PostCSS plugins
- `src/app/globals.css`: Import Tailwind directives

Make sure your `tailwind.config.js` includes the paths to all your template files:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
```

Install the Tailwind CSS forms plugin:

```bash
# Using npm
npm install -D @tailwindcss/forms
# Using yarn
yarn add -D @tailwindcss/forms
# Using pnpm
pnpm add -D @tailwindcss/forms
```

Make sure your `src/app/globals.css` includes the Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .form-input {
    @apply w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500;
  }
  
  .btn-primary {
    @apply px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  }
  
  .btn-secondary {
    @apply px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2;
  }
  
  .card {
    @apply bg-white p-6 rounded-lg shadow-md;
  }
}
```

## Running the Development Server

```bash
# Using npm
npm run dev
# Using yarn
yarn dev
# Using pnpm
pnpm dev
```

The development server will start at `http://localhost:3000`.

## Building for Production

```bash
# Using npm
npm run build
# Using yarn
yarn build
# Using pnpm
pnpm build
```

## Starting the Production Server

```bash
# Using npm
npm start
# Using yarn
yarn start
# Using pnpm
pnpm start

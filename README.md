# Brain Log App

A personalized daily log application for tracking mental health, medication, focus, and emotional well-being.

## Overview

Brain Log App is a modern, responsive web application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and PostgreSQL. It provides a structured way to track daily mental health metrics, medication routines, focus levels, emotional triggers, and reflections.

The app uses a server-side PostgreSQL database for data storage, allowing users to access their data from multiple devices while ensuring data persistence and security. Authentication is implemented using NextAuth.js to protect user data.

## Features

- **User Authentication**: Secure login and registration with password hashing
- **Morning Check-In**: Track sleep quality, dreams, mood, and physical status
- **Medication Routine**: Log medication timing, dosage, and effects
- **Midday Focus Snapshot**: Monitor focus, energy, rumination levels, and triggers
- **Afternoon Checkpoint**: Reflect on social interactions and self-worth patterns
- **End of Day Reflection**: Record overall mood, helpful factors, and challenges
- **Weekly Check-In**: Review patterns and insights from the week
- **Data Visualization**: View trends and patterns over time
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Multi-device Access**: Access your data from any device with internet connection
- **Data Export/Import**: Backup and restore your data

## Getting Started

### Prerequisites

- Node.js (v18.17.0 or later)
- npm, yarn, or pnpm
- PostgreSQL database

### Installation

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

Create a `.env` file in the root directory with the following variables:

```
# Database configuration
DATABASE_URL="postgresql://username:password@localhost:5432/brain_log_db"

# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

4. Set up the database:

```bash
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

```
brain-log-app/
├── prisma/
│   └── schema.prisma       # Database schema
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication API
│   │   │   ├── daily-logs/ # Daily logs API
│   │   │   ├── users/      # Users API
│   │   │   └── weekly-reflections/ # Weekly reflections API
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth/           # Authentication utilities
│   │   ├── db/             # Database utilities
│   │   ├── services/       # API service functions
│   │   └── utils/
│   └── types/
├── docs/
│   ├── API.md              # API documentation
│   ├── ARCHITECTURE.md     # Architecture documentation
│   ├── DATABASE.md         # Database documentation
│   └── DEVELOPMENT.md      # Development guide
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## Documentation

Detailed documentation is available in the `docs` directory:

- [Database Documentation](docs/DATABASE.md)
- [API Documentation](docs/API.md)
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [UI Documentation](docs/UI.md)

## Daily Log Structure

### Morning Check-In
- Sleep hours
- Sleep quality (1-10)
- Dreams (weird/unsettling?)
- Morning mood (1-10)
- Physical status (headache, stomach, tense?)

### Medication + Routine
- Concerta taken at (time)
- Dose (mg)
- Did I eat within 1 hour? (Yes/No)
- First hour feeling (Clear/Foggy/Anxious/Wired/Other)

### Midday Focus + Emotion Snapshot
- Focus (1-10)
- Energy (1-10)
- Rumination Level (1-10)
- Main trigger (if any)
- How I responded (Redirected attention/Talked it out/Journaled/Spiraled/Detached)

### Afternoon Checkpoint
- Any feedback or social interaction that triggered internal spin? (Yes/No + description)
- Self-worth tied to performance today? (Strongly/Mildly/Not at all)
- Did I overextend myself? (Yes/No/Not sure)

### End of Day Reflection
- Overall mood (1-10)
- Was Concerta net positive today? (Yes/No/Mixed)
- What helped me most today?
- What pulled me off track?
- Thought to carry forward tomorrow

### Weekly Check-In (Every 7 Days)
- Average Rumination Score This Week
- Days where I felt "stable"
- Concerta working well (days out of 7)
- Did I question leaving my job this week? (Yes/No)
- One insight I learned about myself this week

## Why This Log Works

- You externalize your thoughts
- You track patterns without judgment
- You build a record of how often your "inner threat voice" is wrong
- You gather evidence that you can make progress—even when it feels like a loop

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by cognitive behavioral therapy techniques
- Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and PostgreSQL

# Brain Log App - Server Database Implementation

This document provides an overview of the server-side database implementation for the Brain Log App. The app has been updated to use a server-side SQLite database instead of the client-side IndexedDB storage.

## Benefits of Server-Side Database

- Data persists across different browsers and devices
- Better security and backup options
- Centralized data management
- Ability to scale as the application grows

## Implementation Overview

The server-side database implementation uses:

- **SQLite**: A file-based database that's easy to set up and maintain
- **Prisma ORM**: A modern database toolkit for TypeScript and Node.js
- **Next.js API Routes**: Server-side API endpoints for CRUD operations
- **NextAuth.js**: Authentication system for user management

## Getting Started

Follow these steps to set up the server-side database:

### 1. Install Dependencies

Run the provided script to install all required dependencies:

```bash
# Make the script executable
chmod +x scripts/install-dependencies.sh

# Run the script
./scripts/install-dependencies.sh
```

This will install:
- Prisma ORM and client
- bcryptjs for password hashing
- NextAuth.js for authentication
- Type definitions for the packages

### 2. Set Up Prisma and Database Schema

Run the provided script to initialize Prisma and create the database schema:

```bash
# Make the script executable
chmod +x scripts/setup-prisma.sh

# Run the script
./scripts/setup-prisma.sh
```

This will:
- Initialize Prisma
- Create a schema.prisma file with the database schema
- Generate the Prisma client

### 3. Create the Database

Create the SQLite database based on the schema:

```bash
npx prisma db push
```

## Project Structure

The server-side database implementation adds the following files to the project:

### Database Setup

- `prisma/schema.prisma`: Database schema definition
- `scripts/install-dependencies.sh`: Script to install required dependencies
- `scripts/setup-prisma.sh`: Script to set up Prisma and create the schema

### API Routes

- `src/app/api/users/route.ts`: API endpoints for user management
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth.js API routes for authentication
- `src/app/api/daily-logs/route.ts`: API endpoints for daily logs (to be implemented)
- `src/app/api/weekly-reflections/route.ts`: API endpoints for weekly reflections (to be implemented)

### Authentication

- `src/lib/auth/auth-options.ts`: NextAuth.js configuration

### Client-Side Services

- `src/lib/services/api.ts`: Utility functions for API requests

## Next Steps

1. Implement the remaining API routes for daily logs and weekly reflections
2. Update the client-side services to use the new API endpoints
3. Update the components to use the new services
4. Test the application with the new server-side database

## Additional Resources

For more detailed information, see the following files:

- `docs/server-database-implementation.md`: Detailed implementation plan
- `prisma/schema.prisma`: Database schema definition

## Backup and Maintenance

The SQLite database is stored as a file at `prisma/brain-log.db`. To back up the database, simply copy this file to a safe location.

For regular maintenance:

1. Create regular backups of the database file
2. Monitor the database size and performance
3. Consider migrating to a more robust database like PostgreSQL if the application grows significantly

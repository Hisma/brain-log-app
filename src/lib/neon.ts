import { neon } from '@neondatabase/serverless';

// Neon serverless driver for Edge Runtime compatibility
// This file should only be imported in server components or API routes
// NOT for use in client components

// Check if DATABASE_URL is defined
const DATABASE_URL = process.env.DATABASE_URL;

if (typeof DATABASE_URL !== 'string') {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export const sql = neon(DATABASE_URL);

// Add a comment to warn developers
/**
 * @fileoverview
 * WARNING: This file contains server-side database code and should NEVER be imported
 * in client components. Only use in:
 * - API routes
 * - Server components (files with 'use server' directive)
 * - Route handlers
 */

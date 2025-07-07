#!/usr/bin/env node

// Enhanced Admin User Management Script for Brain Log App
// Supports creating new admins and updating existing users

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { webcrypto } from 'node:crypto';

// Edge Runtime compatible password hashing - embedded from src/lib/crypto.ts
// Constants for PBKDF2 algorithm
const ITERATIONS = 100000; // High iteration count for security
const HASH_ALGORITHM = 'SHA-256';
const SALT_LENGTH = 16; // 16 bytes = 128 bits
const KEY_LENGTH = 32; // 32 bytes = 256 bits
const HASH_FORMAT = 'PBKDF2';

// Use Node.js webcrypto for compatibility
const crypto = globalThis.crypto || webcrypto;

/**
 * Convert a string to a Uint8Array
 */
function stringToBuffer(str) {
  return new TextEncoder().encode(str);
}

/**
 * Convert a Uint8Array to a base64 string
 */
function bufferToBase64(buffer) {
  const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...uint8Array));
}

/**
 * Generate a random salt
 */
function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Hash a password using PBKDF2 with a random salt
 * Returns a string in the format: PBKDF2:iterations:base64salt:base64hash
 */
async function hashPassword(password) {
  try {
    // Generate a random salt
    const salt = generateSalt();
    
    // Import the password as a key
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      stringToBuffer(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive bits using PBKDF2
    const keyBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: ITERATIONS,
        hash: HASH_ALGORITHM
      },
      passwordKey,
      KEY_LENGTH * 8 // bits
    );
    
    // Convert to base64 strings
    const saltBase64 = bufferToBase64(salt);
    const hashBase64 = bufferToBase64(keyBuffer);
    
    // Return formatted hash string
    return `${HASH_FORMAT}:${ITERATIONS}:${saltBase64}:${hashBase64}`;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw error;
  }
}

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = resolve('.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.error('⚠️  Could not load .env file:', error.message);
    console.error('   Make sure .env file exists and is readable');
  }
}

// Load environment variables
loadEnvFile();

// Database connection
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('   Make sure your .env file contains DATABASE_URL');
  process.exit(1);
}

const dbSql = neon(process.env.DATABASE_URL);

// hashPassword is now imported from src/lib/crypto.js
// This ensures consistent PBKDF2 hashing across the application

function showHelp() {
  console.log(`
🔧 Admin User Management Script

USAGE:
  Create new admin:
    node scripts/create-admin.js <email> <password> <displayName> [username]
    
  Update existing user's display name:
    node scripts/create-admin.js --update-display-name <email> <newDisplayName>
    
  Update existing user to admin:
    node scripts/create-admin.js --promote <email>

EXAMPLES:
  # Create new admin with auto-generated username
  node scripts/create-admin.js admin@example.com MyPassword123 "John Admin"
  
  # Create new admin with specific username  
  node scripts/create-admin.js admin@example.com MyPassword123 "John Admin" johnadmin
  
  # Update display name of existing user
  node scripts/create-admin.js --update-display-name richard.meyer596@gmail.com "Richard Meyer"
  
  # Promote existing user to admin
  node scripts/create-admin.js --promote richard.meyer596@gmail.com

NOTES:
  - Email must be valid format
  - Password must be at least 8 characters  
  - Display name is the friendly name shown in the app
  - Username is auto-generated from email if not provided
  - Script automatically loads DATABASE_URL from .env file
`);
}

async function updateDisplayName(email, newDisplayName) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Check if user exists
    const existing = await dbSql`
      SELECT id, email, username, "displayName", role FROM "User" WHERE email = ${email}
    `;

    if (existing.length === 0) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    const user = existing[0];
    console.log(`✅ Found user: ${user.displayName} (${user.role})`);

    // Update display name
    await dbSql`
      UPDATE "User" 
      SET "displayName" = ${newDisplayName}
      WHERE email = ${email}
    `;

    console.log(`✅ Display name updated successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Old Display Name: ${user.displayName}`);
    console.log(`   New Display Name: ${newDisplayName}`);
    console.log(`   Role: ${user.role}`);
    
  } catch (error) {
    console.error('❌ Failed to update display name:', error.message);
    process.exit(1);
  }
}

async function promoteToAdmin(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Check if user exists
    const existing = await dbSql`
      SELECT id, email, username, "displayName", role FROM "User" WHERE email = ${email}
    `;

    if (existing.length === 0) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    const user = existing[0];
    console.log(`✅ Found user: ${user.displayName} (${user.role})`);

    if (user.role === 'ADMIN') {
      console.log('✅ User is already an admin. No changes needed.');
      return;
    }

    // Promote to admin
    await dbSql`
      UPDATE "User" 
      SET role = 'ADMIN', "isActive" = true, "approvedAt" = NOW()
      WHERE email = ${email}
    `;

    console.log(`✅ User promoted to admin successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Display Name: ${user.displayName}`);
    console.log(`   Old Role: ${user.role}`);
    console.log(`   New Role: ADMIN`);
    
  } catch (error) {
    console.error('❌ Failed to promote user to admin:', error.message);
    process.exit(1);
  }
}

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];  
  const displayName = args[2];
  let username = args[3];

  if (!email || !password || !displayName) {
    console.error('❌ Missing required parameters for creating admin');
    showHelp();
    process.exit(1);
  }

  // Auto-generate username from email if not provided
  if (!username) {
    username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    console.log(`📝 Auto-generated username: ${username}`);
  }

  // Basic validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('❌ Invalid email format');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    process.exit(1);
  }

  if (displayName.length < 2) {
    console.error('❌ Display name must be at least 2 characters long');
    process.exit(1);
  }

  try {
    console.log('🔍 Checking if user already exists...');

    // Check if user already exists
    const existing = await dbSql`
      SELECT id, email, username, "displayName", role FROM "User" 
      WHERE email = ${email} OR username = ${username}
    `;

    if (existing.length > 0) {
      const user = existing[0];
      console.log(`⚠️  User already exists:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Display Name: ${user.displayName}`);
      console.log(`   Role: ${user.role}`);
      
      if (user.role === 'ADMIN') {
        console.log('✅ User is already an admin. No changes needed.');
      } else {
        console.log('💡 Use --promote flag to make this user an admin');
      }
      process.exit(0);
    }

    console.log('🔐 Hashing password...');
    const passwordHash = await hashPassword(password);

    console.log('👤 Creating admin user...');
    
    const admin = await dbSql`
      INSERT INTO "User" (
        username, email, "passwordHash", "displayName", role, "isActive", "approvedAt", "createdAt"
      ) VALUES (
        ${username}, ${email}, ${passwordHash}, ${displayName}, 'ADMIN', true, NOW(), NOW()
      ) RETURNING id, username, email, "displayName", role
    `;

    console.log('✅ Admin user created successfully!');
    console.log(`   ID: ${admin[0].id}`);
    console.log(`   Email: ${admin[0].email}`);
    console.log(`   Username: ${admin[0].username}`);
    console.log(`   Display Name: ${admin[0].displayName}`);
    console.log(`   Role: ${admin[0].role}`);

    // Update system settings with admin email if needed
    console.log('⚙️  Updating system settings...');
    
    const settings = await dbSql`
      SELECT "adminEmail" FROM "SystemSettings" WHERE id = 'system'
    `;

    if (settings.length === 0) {
      // Create system settings
      await dbSql`
        INSERT INTO "SystemSettings" (
          id, "registrationEnabled", "siteName", "adminEmail", "maxFailedLoginAttempts", "lockoutDurationMinutes", "createdAt", "updatedAt"
        ) VALUES (
          'system', true, 'Brain Log App', ${email}, 5, 15, NOW(), NOW()
        )
      `;
      console.log('✅ System settings created with admin email');
    } else if (!settings[0].adminEmail || settings[0].adminEmail === 'admin@brainlogapp.com') {
      // Update admin email if it's default or empty
      await dbSql`
        UPDATE "SystemSettings" 
        SET "adminEmail" = ${email}
        WHERE id = 'system'
      `;
      console.log('✅ System settings updated with admin email');
    }

    console.log('\n🎉 Setup complete! You can now:');
    console.log('   1. Login with your admin credentials');
    console.log('   2. Access the admin panel at /admin');
    console.log('   3. Manage user registrations and system settings');

  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    console.error('\nTroubleshooting:');
    console.error('   1. Make sure DATABASE_URL environment variable is set in .env');
    console.error('   2. Ensure the database is accessible');
    console.error('   3. Verify Prisma migrations have been run');
    console.error('   4. Check database permissions');
    process.exit(1);
  }
}

// Main script logic
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    process.exit(0);
  }
  
  if (args[0] === '--update-display-name') {
    if (args.length < 3) {
      console.error('❌ --update-display-name requires email and new display name');
      console.error('   Usage: node scripts/create-admin.js --update-display-name <email> <newDisplayName>');
      process.exit(1);
    }
    await updateDisplayName(args[1], args[2]);
  } else if (args[0] === '--promote') {
    if (args.length < 2) {
      console.error('❌ --promote requires email');
      console.error('   Usage: node scripts/create-admin.js --promote <email>');
      process.exit(1);
    }
    await promoteToAdmin(args[1]);
  } else {
    await createAdmin();
  }
}

main().then(() => process.exit(0)).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

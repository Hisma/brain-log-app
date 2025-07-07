#!/usr/bin/env node

// Test script to debug PBKDF2 password hashing
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { webcrypto } from 'node:crypto';

// Same PBKDF2 implementation as create-admin.js
const ITERATIONS = 100000;
const HASH_ALGORITHM = 'SHA-256';
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const HASH_FORMAT = 'PBKDF2';

const crypto = globalThis.crypto || webcrypto;

function stringToBuffer(str) {
  return new TextEncoder().encode(str);
}

function bufferToBase64(buffer) {
  const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...uint8Array));
}

function base64ToBuffer(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

async function hashPassword(password) {
  const salt = generateSalt();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const keyBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM
    },
    passwordKey,
    KEY_LENGTH * 8
  );
  
  const saltBase64 = bufferToBase64(salt);
  const hashBase64 = bufferToBase64(keyBuffer);
  
  return `${HASH_FORMAT}:${ITERATIONS}:${saltBase64}:${hashBase64}`;
}

async function comparePasswords(password, hashString) {
  if (!hashString.startsWith(HASH_FORMAT)) {
    return false;
  }
  
  const parts = hashString.split(':');
  const iterationsStr = parts[1];
  const saltBase64 = parts[2];
  const hashBase64 = parts[3];
  const iterations = parseInt(iterationsStr, 10);
  const salt = base64ToBuffer(saltBase64);
  
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const keyBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: HASH_ALGORITHM
    },
    passwordKey,
    KEY_LENGTH * 8
  );
  
  const derivedHashBase64 = bufferToBase64(keyBuffer);
  return derivedHashBase64 === hashBase64;
}

// Load environment variables
function loadEnvFile() {
  try {
    const envPath = resolve('.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.error('Could not load .env file:', error.message);
  }
}

async function main() {
  loadEnvFile();
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }
  
  const dbSql = neon(process.env.DATABASE_URL);
  const testPassword = "Bitware11!!!";
  
  console.log('🧪 Password Hash Test');
  console.log('Password to test:', testPassword);
  console.log('');
  
  // Generate new hash
  console.log('1. Generating new hash...');
  const newHash = await hashPassword(testPassword);
  console.log('New hash:', newHash);
  console.log('');
  
  // Test new hash comparison
  console.log('2. Testing new hash comparison...');
  const newHashMatch = await comparePasswords(testPassword, newHash);
  console.log('New hash matches:', newHashMatch);
  console.log('');
  
  // Get existing hash from database
  console.log('3. Getting existing hash from database...');
  const users = await dbSql`
    SELECT username, "passwordHash" FROM "User" WHERE username = 'Hisma'
  `;
  
  if (users.length > 0) {
    const existingHash = users[0].passwordHash;
    console.log('Existing hash:', existingHash);
    console.log('');
    
    // Test existing hash comparison
    console.log('4. Testing existing hash comparison...');
    const existingHashMatch = await comparePasswords(testPassword, existingHash);
    console.log('Existing hash matches:', existingHashMatch);
    console.log('');
    
    // Compare hash formats
    console.log('5. Hash format analysis:');
    const newParts = newHash.split(':');
    const existingParts = existingHash.split(':');
    
    console.log('New hash parts:', {
      format: newParts[0],
      iterations: newParts[1],
      saltLength: newParts[2]?.length,
      hashLength: newParts[3]?.length
    });
    
    console.log('Existing hash parts:', {
      format: existingParts[0],
      iterations: existingParts[1],
      saltLength: existingParts[2]?.length,
      hashLength: existingParts[3]?.length
    });
  } else {
    console.log('❌ No user found with username "Hisma"');
  }
}

main().catch(console.error);

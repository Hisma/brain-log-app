#!/usr/bin/env node

/**
 * This script resets the database by running Prisma migrations.
 * It will drop all tables and recreate them with the updated schema.
 * 
 * Usage:
 * node scripts/reset-database.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to execute commands and log output
function executeCommand(command, description) {
  console.log(`\n${colors.cyan}${description}...${colors.reset}`);
  console.log(`${colors.yellow}> ${command}${colors.reset}`);
  
  try {
    const output = execSync(command, { stdio: 'pipe' }).toString();
    console.log(`${colors.green}✓ Success${colors.reset}`);
    if (output) {
      console.log(output);
    }
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Error${colors.reset}`);
    console.error(error.stdout ? error.stdout.toString() : error.message);
    return false;
  }
}

// Main function
async function resetDatabase() {
  console.log(`${colors.magenta}=== Database Reset Script ===${colors.reset}`);
  console.log(`${colors.yellow}This script will reset your database and apply the latest schema changes.${colors.reset}`);
  console.log(`${colors.yellow}All existing data will be lost.${colors.reset}`);
  
  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error(`${colors.red}Error: .env file not found. Please create one with your database connection string.${colors.reset}`);
    process.exit(1);
  }
  
  // Reset the database
  if (!executeCommand('npx prisma migrate reset --force', 'Resetting database')) {
    console.error(`${colors.red}Failed to reset database. Aborting.${colors.reset}`);
    process.exit(1);
  }
  
  // Generate Prisma client
  if (!executeCommand('npx prisma generate', 'Generating Prisma client')) {
    console.error(`${colors.red}Failed to generate Prisma client. Aborting.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`\n${colors.green}Database reset complete!${colors.reset}`);
  console.log(`${colors.cyan}The database has been reset with the updated schema.${colors.reset}`);
  console.log(`${colors.cyan}You can now start the application with:${colors.reset}`);
  console.log(`${colors.yellow}> npm run dev${colors.reset}`);
}

// Run the script
resetDatabase().catch((error) => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});

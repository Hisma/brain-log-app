#!/bin/bash

# Script to install dependencies for the server-side database implementation
# This script will install:
# 1. Prisma ORM and client
# 2. bcryptjs for password hashing
# 3. next-auth for authentication
# 4. Types for the packages

# Exit on error
set -e

echo "Installing dependencies for server-side database implementation..."

# Check if we're in the right directory
if [ ! -d "src" ] || [ ! -f "package.json" ]; then
  echo "Error: Please run this script from the root of the Brain Log App project."
  exit 1
fi

# Install Prisma
echo "Installing Prisma..."
npm install @prisma/client
npm install --save-dev prisma

# Install Prisma Accelerate extension
echo "Installing Prisma Accelerate extension..."
npm install @prisma/extension-accelerate

# Install bcryptjs for password hashing
echo "Installing bcryptjs..."
npm install bcryptjs
npm install --save-dev @types/bcryptjs

# Install next-auth for authentication
echo "Installing next-auth..."
npm install next-auth

echo "All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Run the setup-prisma.sh script to initialize Prisma and create the schema"
echo "2. Follow the server-database-implementation.md guide to implement the API routes"
echo ""
echo "Note: You may need to restart your TypeScript server in VS Code to resolve any type errors."

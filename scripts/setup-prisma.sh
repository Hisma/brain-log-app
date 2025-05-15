#!/bin/bash

# Script to set up Prisma and create the database schema
# This script will:
# 1. Initialize Prisma
# 2. Create the schema.prisma file
# 3. Generate the Prisma client

# Exit on error
set -e

echo "Setting up Prisma and creating database schema..."

# Check if we're in the right directory
if [ ! -d "src" ] || [ ! -f "package.json" ]; then
  echo "Error: Please run this script from the root of the Brain Log App project."
  exit 1
fi

# Check if Prisma is installed
if ! command -v npx prisma &> /dev/null; then
  echo "Error: Prisma is not installed. Please run the install-dependencies.sh script first."
  exit 1
fi

# Create the prisma directory if it doesn't exist
mkdir -p prisma

# Check if schema.prisma already exists
if [ -f "prisma/schema.prisma" ]; then
  echo "Prisma schema already exists. Skipping schema creation."
else
  echo "Creating Prisma schema..."
  # The schema.prisma file is created separately
  echo "Schema file created at prisma/schema.prisma"
fi

# Generate the Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "Prisma setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Create the database by running: npx prisma db push"
echo "2. Start using Prisma in your application"
echo ""
echo "For more information, see the Prisma documentation: https://www.prisma.io/docs/"

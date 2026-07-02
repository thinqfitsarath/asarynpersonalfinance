#!/bin/bash

# Family Legacy Manager - Local Setup Script
# This script will set up everything you need to run the app locally

echo "🚀 Family Legacy Manager - Setup Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔑 Generating secure keys..."

    # Generate NEXTAUTH_SECRET
    NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

    # Generate ENCRYPTION_KEY
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

    # Create .env file
    cat > .env << EOF
# Database (PostgreSQL — start one locally with:
#   docker run -d --name flm-pg -p 5432:5432 -e POSTGRES_PASSWORD=localdev -e POSTGRES_DB=familylegacy postgres:16)
DATABASE_URL="postgresql://postgres:localdev@localhost:5432/familylegacy"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Encryption Key (REQUIRED)
ENCRYPTION_KEY="$ENCRYPTION_KEY"
EOF

    echo "✅ Environment variables created (.env file)"
else
    echo "✅ .env file already exists"
fi

echo ""

# Set up database (requires the PostgreSQL from DATABASE_URL to be running)
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to set up database"
    exit 1
fi

echo "✅ Database ready"
echo ""

# Success message
echo "🎉 Setup Complete!"
echo ""
echo "To start the application, run:"
echo "  npm run dev"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:3000"
echo ""
echo "Happy password managing! 🔐"

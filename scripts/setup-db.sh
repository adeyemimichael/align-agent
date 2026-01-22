#!/bin/bash

# Database setup script for Adaptive Productivity Agent

echo "🚀 Setting up database for Adaptive Productivity Agent..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first."
    echo "   macOS: brew install postgresql@16"
    echo "   Linux: sudo apt install postgresql"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update DATABASE_URL with your credentials."
    exit 0
fi

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate dev --name init

if [ $? -eq 0 ]; then
    echo "✅ Database setup complete!"
    echo "🎉 You can now start the development server with: npm run dev"
else
    echo "❌ Migration failed. Please check your database connection."
    echo "   See DATABASE_SETUP.md for detailed instructions."
    exit 1
fi

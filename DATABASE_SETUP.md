# Database Setup Instructions

## Prerequisites

You need PostgreSQL installed and running on your system.

### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

## Database Configuration

1. Create a new PostgreSQL database:
```bash
createdb adaptive_productivity
```

Or using psql:
```bash
psql postgres
CREATE DATABASE adaptive_productivity;
\q
```

2. Update your `.env` file with your database credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/adaptive_productivity?schema=public"
```

Replace `username` and `password` with your PostgreSQL credentials.

## Run Migrations

Once your database is configured, run the initial migration:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate the Prisma Client
- Apply the schema to your database

## Verify Setup

Check that the migration was successful:

```bash
npx prisma studio
```

This opens a browser-based GUI to view your database.

## Alternative: Use Docker

If you prefer Docker, you can run PostgreSQL in a container:

```bash
docker run --name adaptive-productivity-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=adaptive_productivity \
  -p 5432:5432 \
  -d postgres:16
```

Then update your `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/adaptive_productivity?schema=public"
```

## Troubleshooting

**Connection refused:**
- Ensure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check the port (default is 5432)
- Verify credentials in `.env`

**Permission denied:**
- Make sure your PostgreSQL user has the necessary permissions
- Try using the `postgres` superuser initially

**Database doesn't exist:**
- Create it manually using `createdb` or `psql`

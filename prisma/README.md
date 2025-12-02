# Database Setup Guide

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project

## Getting Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** > **Database**
3. Find the **Connection String** section
4. Copy the **Connection pooling** string (recommended for Next.js)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true`

## Setup Steps

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase connection string:

```env
DATABASE_URL="your-supabase-connection-string-here"
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Run Database Migrations

For the first migration, you may need to use the direct connection (port 5432) instead of connection pooling:

```bash
# Temporarily update DATABASE_URL in .env.local to use port 5432
# Then run:
npm run db:migrate
```

Or use Prisma's push command (good for development):

```bash
npm run db:push
```

### 4. Seed the Database

```bash
npm run db:seed
```

This will create:

- Default admin user (email: `admin@school.com`, password: `admin123`)
- Three grading policies:
  - Standard Letter Grades (A-F)
  - Plus/Minus Letter Grades (A+ to F)
  - Numeric (0-100)

### 5. View Your Database

Open Prisma Studio to view and edit your data:

```bash
npm run db:studio
```

## Common Commands

- `npm run db:migrate` - Create and run a new migration
- `npm run db:push` - Push schema changes without creating migration files (dev only)
- `npm run db:seed` - Seed the database with initial data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma Client

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check your connection string** - Make sure it's correct and includes your password
2. **Use direct connection for migrations** - Change port from 6543 to 5432 in DATABASE_URL
3. **Check Supabase project status** - Ensure your project is active
4. **Verify network access** - Some networks may block database connections

### Migration Issues

If migrations fail:

1. Try using `npm run db:push` instead (for development)
2. Check if your schema has any syntax errors
3. Ensure you're using the direct connection (port 5432) for migrations

### Seed Issues

If seeding fails:

1. Make sure migrations have been run first
2. Check that bcryptjs is installed: `npm install bcryptjs`
3. Verify your database connection is working

## Production Deployment

For production:

1. Create a separate Supabase project for production
2. Use environment variables in your hosting platform (Vercel, etc.)
3. Run migrations against production database
4. **Important**: Change the default admin password immediately!

## Connection Pooling vs Direct Connection

- **Connection Pooling (port 6543)**: Use for your Next.js application in production
- **Direct Connection (port 5432)**: Use for running migrations and Prisma Studio

You can set both in your `.env.local`:

```env
DATABASE_URL="postgresql://...@....supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...@....supabase.co:5432/postgres"
```

Then update your `schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# School Management System

A full-stack web application for school management with role-based access control (Admin, Teacher, Student), class enrollment, gradebook, exams, and notifications.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Internationalization**: next-intl (English & Bahasa Indonesia)

## Prerequisites

- Node.js 18+
- A Supabase account and project ([sign up here](https://supabase.com))

## Setup

### 1. Supabase Database Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Go to Project Settings > Database
3. Copy your connection string (use the "Connection Pooling" string for serverless environments)
4. The connection string format: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true`

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Database
DATABASE_URL="your-supabase-connection-string-here"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Add other environment variables as needed
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev
```

### 5. Seed the Database (Optional)

```bash
npx prisma db seed
```

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Database Management

### Prisma Studio

View and edit your database:

```bash
npx prisma studio
```

### Creating Migrations

After modifying the Prisma schema:

```bash
npx prisma migrate dev --name your_migration_name
```

## Deployment

### Vercel + Supabase

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `DATABASE_URL` (use Supabase connection pooling URL)
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
4. Deploy!

### Supabase Production Setup

- Use separate Supabase projects for development and production
- Enable connection pooling for serverless environments
- Monitor database performance in Supabase dashboard
- Set up database backups in Supabase project settings

## Project Structure

See `.kiro/specs/school-management-system/` for detailed:

- Requirements documentation
- System design and architecture
- Implementation tasks and roadmap

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

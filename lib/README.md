# Authentication Setup

This directory contains the authentication configuration for the School Management System using NextAuth.js v5.

## Files

- **auth.ts** - Main NextAuth.js configuration with credentials provider
- **auth-helpers.ts** - Helper functions for authentication and authorization

## Authentication Flow

1. User submits email and password via login form
2. Credentials are validated against the database
3. Password is verified using bcrypt
4. User's active status is checked
5. JWT token is created with user info (id, role, locale)
6. Session is established

## Usage

### Server Components

```typescript
import { getCurrentUser, requireAuth, requireRole } from "@/lib/auth-helpers";

// Get current user (returns null if not authenticated)
const user = await getCurrentUser();

// Require authentication (redirects to login if not authenticated)
const session = await requireAuth();

// Require specific role (redirects to unauthorized if wrong role)
const session = await requireRole("ADMIN");
// or multiple roles
const session = await requireRole(["ADMIN", "TEACHER"]);
```

### Client Components

```typescript
"use client";
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Not authenticated</div>;
  }

  return <div>Hello {session?.user?.name}</div>;
}
```

### Sign In/Out

```typescript
import { signIn, signOut } from "@/lib/auth";

// Sign in
await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  redirectTo: "/dashboard",
});

// Sign out
await signOut({ redirectTo: "/login" });
```

## Middleware

The middleware in `/middleware.ts` handles:

- Redirecting unauthenticated users to login
- Redirecting authenticated users away from login page
- Role-based route protection:
  - `/admin/*` - Admin only
  - `/teacher/*` - Teacher and Admin
  - `/student/*` - Student and Admin

## Environment Variables

Required in `.env.local`:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
AUTH_SECRET="your-secret-key"
```

Generate a secret with:

```bash
openssl rand -base64 32
```

## Session Data

The session includes:

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
    locale: string;
  }
}
```

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with secure secrets
- Active user status checking
- Role-based access control
- Session strategy: JWT (stateless)
- Automatic session refresh

## Testing

Default admin credentials (created by seed):

- Email: `admin@school.com`
- Password: `admin123`

**⚠️ Change the admin password after first login in production!**

# Authentication Setup Guide

## Overview

This guide explains how to set up and use the authentication system in the DYHE Platform.

## Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Email/Username login support
- ✅ TanStack Query for state management
- ✅ Axios with automatic token refresh
- ✅ Next.js middleware for route protection
- ✅ Protected routes and redirects
- ✅ User profile management
- ✅ Logout functionality

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the web app root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Database Setup

1. Set up your PostgreSQL database
2. Create a `.env` file in the API root with your database URL
3. Run the following commands in the API directory:

```bash
# Generate Prisma client
pnpm run db:generate

# Push database schema
pnpm run db:push

# Seed the database with test users
pnpm run db:seed
```

### 3. Start the Applications

```bash
# Start the API server (from apps/api)
pnpm run start:dev

# Start the web app (from apps/web)
pnpm run dev
```

## Test Accounts

The seed script creates the following test accounts:

| Email                  | Password    | Role        |
| ---------------------- | ----------- | ----------- |
| admin@dyhe.com         | admin123    | SUPER_ADMIN |
| john.doe@example.com   | password123 | USER        |
| jane.smith@example.com | password123 | ADMIN       |
| driver1@dyhe.com       | password123 | DRIVER      |
| merchant1@dyhe.com     | password123 | MERCHANT    |

## Usage

### 1. Login

- Navigate to `/sign-in`
- Use any of the test accounts above
- You'll be redirected to the dashboard upon successful login

### 2. Protected Routes

The following routes require authentication:

- `/dashboard`
- `/packages`
- `/scan`
- `/merchants`
- `/drivers`
- `/team`
- `/customers`
- `/reports`
- `/settings`

### 3. Logout

- Click on your avatar in the top-right corner
- Select "Logout" from the dropdown menu

## API Endpoints

### Authentication

- `POST /auth/login` - Login with email/username and password
- `POST /auth/register` - Register new user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/profile` - Get user profile

### Request/Response Examples

#### Login Request

```json
{
  "emailOrUsername": "admin@dyhe.com",
  "password": "admin123"
}
```

#### Login Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "name": "Admin User",
    "email": "admin@dyhe.com",
    "role": "SUPER_ADMIN"
  }
}
```

## File Structure

```
apps/web/
├── contexts/
│   └── AuthContext.tsx          # Authentication context provider
├── hooks/
│   └── useAuth.ts               # TanStack Query hooks for auth
├── lib/
│   ├── api.ts                   # Axios client with interceptors
│   └── auth.ts                  # Auth API functions
├── middleware.ts                # Next.js middleware for route protection
└── app/
    ├── (auth)/
    │   └── sign-in/
    │       └── page.tsx         # Sign-in page
    └── (root)/
        ├── layout.tsx           # Main layout with auth
        └── dashboard/
            └── page.tsx         # Dashboard page
```

## Key Components

### 1. AuthProvider

Wraps the entire app and provides authentication context:

```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

### 2. useAuth Hook

Provides authentication state and user information:

```tsx
const { user, isAuthenticated, isLoading } = useAuth();
```

### 3. useLogin Hook

Handles login mutations:

```tsx
const loginMutation = useLogin();
await loginMutation.mutateAsync({ emailOrUsername, password });
```

### 4. useLogout Hook

Handles logout:

```tsx
const logoutMutation = useLogout();
logoutMutation.mutate();
```

## Security Features

1. **JWT Tokens**: Access tokens (15min) and refresh tokens (7days)
2. **Automatic Refresh**: Tokens are automatically refreshed when expired
3. **Route Protection**: Middleware protects authenticated routes
4. **Secure Storage**: Tokens stored in HTTP-only cookies
5. **Password Hashing**: Bcrypt with salt rounds
6. **Input Validation**: Class-validator for request validation

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the API server is running on the correct port
2. **Token Expired**: The system should automatically refresh tokens
3. **Route Protection**: Check middleware configuration
4. **Database Connection**: Verify DATABASE_URL in API .env file

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## Next Steps

1. Implement user registration page
2. Add password reset functionality
3. Implement role-based access control
4. Add user profile editing
5. Implement session management
6. Add two-factor authentication

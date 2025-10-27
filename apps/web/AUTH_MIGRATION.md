# Authentication Migration Summary

This document summarizes the authentication implementation migrated from `web-old` to `web` using shadcn/ui.

## What Was Done

### 1. Dependencies Installed
- `axios` - HTTP client for API calls
- `js-cookie` - Cookie management
- `@tanstack/react-query` - Data fetching and caching
- `sonner` - Toast notifications
- `lucide-react` - Icon library

### 2. Files Created

#### Authentication API & Context
- **`src/lib/api.ts`** - Axios instance with interceptors for:
  - Adding JWT tokens to requests
  - Automatic token refresh on 401 responses
  - Handling token expiration and logout
- **`src/lib/auth.ts`** - Auth API functions:
  - `login()` - User authentication
  - `register()` - User registration
  - `refreshToken()` - Token refresh
  - `logout()` - User logout
  - `getProfile()` - Get current user profile

#### Context & Hooks
- **`src/contexts/AuthContext.tsx`** - Authentication context provider with:
  - QueryClient setup
  - Auth state management
  - Profile loading
- **`src/hooks/useAuth.ts`** - Authentication hooks:
  - `useLogin()` - Login mutation
  - `useRegister()` - Registration mutation
  - `useLogout()` - Logout mutation
  - `useProfile()` - Get user profile query
  - `useIsAuthenticated()` - Check authentication status

#### Login Page
- **`src/routes/login.tsx`** - Login page with:
  - Beautiful shadcn/ui components (Card, Form, Input, Button)
  - Form validation using zod and react-hook-form
  - Email/Username and password fields
  - Icons from lucide-react
  - Toast notifications for success/error

### 3. Files Modified

#### Root Route
- **`src/routes/__root.tsx`** - Updated to:
  - Include AuthProvider wrapper
  - Include Toaster for notifications
  - Use Outlet for child routes instead of MainLayout
- **`src/layouts/MainLayout.tsx`** - Modified to:
  - Accept children prop instead of using Outlet
  - Can be used in individual authenticated routes

#### Dashboard Route
- **`src/routes/dashboard/index.tsx`** - Updated to use MainLayout

## How to Use

### 1. Setup Environment Variables

Create a `.env` file in the `apps/web` directory:

```env
VITE_API_URL=http://localhost:8000
```

### 2. Start the Development Server

```bash
cd apps/web
pnpm dev
```

### 3. Access the Login Page

Navigate to `http://localhost:5173/login` (or your configured port)

### 4. Protected Routes

To protect a route, you can use the `useAuth` hook:

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";

function MyProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected Content</div>;
}
```

## Features

### ✅ Implemented
- JWT token management with automatic refresh
- Login page with shadcn/ui components
- Form validation using zod
- Toast notifications for user feedback
- Auth context for global state management
- Automatic token refresh on expired tokens
- Cookie-based token storage

### 🎨 UI Components Used
- **Card** - Container for login form
- **Form** - Form management with validation
- **Input** - Text input fields with icons
- **Button** - Submit button with loading state
- **Toaster** - Toast notification system

### 📝 Form Validation
- Email/Username field is required
- Password field is required
- Visual feedback for validation errors
- Disabled button during submission

## API Endpoints

The authentication system uses the following endpoints (from your backend):

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/profile` - Get current user profile

## Next Steps

1. **Add Protected Routes** - Implement route guards for authenticated routes
2. **Add Registration Page** - Create a registration page similar to login
3. **Add Password Reset** - Implement forgot password functionality
4. **Update Dashboard** - Migrate dashboard content from web-old
5. **Add User Profile** - Create user profile page with logout functionality

## Testing

1. Start your backend API server
2. Start the web development server
3. Navigate to `/login`
4. Login with valid credentials
5. You should be redirected to `/dashboard`

## Notes

- The login page does NOT show the sidebar (good!)
- The dashboard shows the MainLayout with sidebar (perfect!)
- Tokens are stored in cookies and automatically attached to requests
- Token refresh happens automatically when a request returns 401
- User is redirected to login when tokens expire


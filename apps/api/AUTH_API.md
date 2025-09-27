# Authentication API Documentation

## Overview

This API provides authentication functionality with JWT tokens and refresh tokens. Users can login with either email or username.

## Endpoints

### 1. Register User

**POST** `/auth/register`

Creates a new user account.

**Request Body:**

```json
{
  "username": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "gender": "MALE" | "FEMALE" (optional),
  "role": "USER" | "ADMIN" | "SUPER_ADMIN" | "DRIVER" | "MERCHANT" (optional)
}
```

**Response:**

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

### 2. Login User

**POST** `/auth/login`

Authenticates a user with email/username and password.

**Request Body:**

```json
{
  "emailOrUsername": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

### 3. Refresh Token

**POST** `/auth/refresh`

Refreshes the access token using the refresh token.

**Request Body:**

```json
{
  "refreshToken": "string"
}
```

**Response:**

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

### 4. Logout

**POST** `/auth/logout`

Logs out the current user. Requires authentication.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

### 5. Get Profile

**POST** `/auth/profile`

Gets the current user's profile. Requires authentication.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "id": "string",
  "username": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "status": "ACTIVE"
}
```

## Environment Variables

Create a `.env` file in the API root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dyhe_platform?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Server
PORT=3000
```

## Features

- ✅ Email/Username login support
- ✅ JWT access tokens (15 minutes)
- ✅ Refresh tokens (7 days)
- ✅ Password hashing with bcrypt
- ✅ User registration
- ✅ Protected routes with JWT guards
- ✅ Role-based authentication
- ✅ Input validation with class-validator

## Usage Example

1. **Register a new user:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "securepassword123"
  }'
```

2. **Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "john@example.com",
    "password": "securepassword123"
  }'
```

3. **Access protected route:**

```bash
curl -X POST http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

4. **Refresh token:**

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

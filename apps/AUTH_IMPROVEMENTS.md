# Authentication Improvements

## Problem

Users were being logged out after 15 minutes of activity due to short JWT token expiration.

## Solution Implemented

### 1. **Extended Token Expiration Times**

#### Backend Changes:

- **Access Token**: Increased from `15m` to `1h` (1 hour)
- **Refresh Token**: Increased from `7d` to `30d` (30 days)

**Files Modified:**

- `apps/api/env.example` - Updated default values
- `apps/api/src/modules/auth/auth.module.ts` - Updated fallback default
- `apps/api/src/modules/auth/auth.service.ts` - Updated token generation defaults

### 2. **Improved Token Refresh Mechanism**

#### Frontend Changes:

- **Cookie Expiration**:
  - Access token cookie: `7 days` (longer than token itself for seamless refresh)
  - Refresh token cookie: `30 days` (matches token expiration)

- **Automatic Token Refresh**:
  - Added singleton pattern to prevent multiple simultaneous refresh requests
  - Improved error handling with automatic redirect to login on refresh failure
  - Tokens are automatically refreshed when a 401 error is encountered

**Files Modified:**

- `apps/web/lib/api.ts` - Enhanced refresh logic with singleton pattern
- `apps/web/hooks/useAuth.ts` - Updated cookie expiration times

## How It Works Now

### Token Lifecycle:

1. **Login**: User logs in and receives:
   - Access token (expires in 1 hour)
   - Refresh token (expires in 30 days)
   - Both stored in cookies with extended expiration

2. **API Requests**:
   - Access token is automatically attached to every request
   - If token is valid, request proceeds normally

3. **Token Expiration**:
   - When access token expires (after 1 hour), API returns 401
   - Frontend automatically uses refresh token to get new access token
   - New tokens are stored and request is retried
   - User experiences no interruption

4. **Refresh Token Expiration**:
   - If refresh token expires (after 30 days of inactivity)
   - User is redirected to login page
   - This only happens if user hasn't used the app for 30 days

### Security Features:

- **Singleton Refresh**: Prevents multiple simultaneous refresh requests
- **Automatic Cleanup**: Tokens are cleared on refresh failure
- **Secure Storage**: Tokens stored in HTTP-only cookies (when configured)
- **Automatic Redirect**: Failed refresh redirects to login page

## Environment Variables

Make sure to set these in your `.env` file:

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_EXPIRATION="1h"  # Access token expires in 1 hour
JWT_REFRESH_EXPIRATION="30d"  # Refresh token expires in 30 days
```

## Benefits

✅ **Better User Experience**: Users stay logged in for much longer
✅ **Seamless Refresh**: Automatic token refresh without user intervention
✅ **Secure**: Still maintains security with refresh token rotation
✅ **Reliable**: Singleton pattern prevents race conditions
✅ **Graceful Degradation**: Automatic redirect on authentication failure

## Testing

To test the authentication flow:

1. **Login**: Verify tokens are stored in cookies
2. **Wait 1 hour**: Make an API request after access token expires
3. **Verify**: Request should succeed after automatic refresh
4. **Check Cookies**: New access token should be stored

## Troubleshooting

### Issue: Still getting logged out quickly

**Solution**:

1. Check that `.env` file has the updated JWT_EXPIRATION values
2. Restart the backend server after updating `.env`
3. Clear browser cookies and login again

### Issue: Refresh token not working

**Solution**:

1. Check that JWT_REFRESH_SECRET is set in `.env`
2. Verify backend `/auth/refresh` endpoint is working
3. Check browser console for error messages

## Future Improvements

Potential enhancements for the future:

1. **Proactive Refresh**: Refresh token before it expires (e.g., at 50 minutes)
2. **Token Blacklisting**: Implement token blacklist for logout
3. **Session Management**: Track active sessions in database
4. **Remember Me**: Optional longer session for "remember me" feature
5. **Activity Tracking**: Extend session on user activity

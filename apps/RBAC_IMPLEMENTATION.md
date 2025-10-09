# Role-Based Access Control (RBAC) Implementation

## Overview

This document describes the RBAC implementation for the DYHE Platform, which restricts access to features and actions based on user roles.

## User Roles

### 1. SUPER_ADMIN

- **Full Access**: Complete access to all features and actions
- **Can View**: All pages and resources
- **Can Create/Edit/Delete**: Everything including team management

### 2. ADMIN

- **Most Access**: Access to operational features
- **Can View**: Dashboard, Packages, Merchants, Drivers, Reports, Settings
- **Can Create/Edit/Delete**: Packages, Merchants, Drivers
- **Cannot Access**: Team management (user creation/deletion)
- **Reports**: Read-only access

### 3. USER (Limited Access)

- **Limited Access**: Basic operational access only
- **Can View**: Dashboard, Packages, Merchants (read-only), Drivers (read-only), Settings
- **Can Create/Edit**: Packages only
- **Cannot Delete**: Any resources
- **Cannot Access**: Team management, Reports
- **Cannot Create**: Merchants, Drivers, Team members

### 4. DRIVER

- **Own Data Access**: Access to their assigned packages
- **Can View**: Dashboard, their own packages
- **Can Edit**: Package status (delivery updates)
- **Cannot Access**: Merchants, Drivers, Team, Reports

### 5. MERCHANT

- **Own Data Access**: Access to their own packages
- **Can View**: Dashboard, their own packages
- **Can Create**: New packages for their business
- **Cannot Access**: Merchants list, Drivers, Team, Reports

## Frontend Implementation

### 1. Menu Filtering (`apps/web/app/(root)/layout.tsx`)

The sidebar menu is dynamically filtered based on user role:

```typescript
// Menu items are filtered using canView() permission check
const menuItems = getFilteredMenuItems(user?.role);
```

**Hidden for USER role:**

- Team
- Reports

### 2. Permission Utility (`apps/web/lib/rbac.ts`)

Centralized permission checking functions:

```typescript
// Check specific permissions
canView(userRole, "packages"); // Can user view packages?
canCreate(userRole, "packages"); // Can user create packages?
canEdit(userRole, "packages"); // Can user edit packages?
canDelete(userRole, "packages"); // Can user delete packages?

// Role checks
isAdmin(userRole); // Is user ADMIN or SUPER_ADMIN?
isSuperAdmin(userRole); // Is user SUPER_ADMIN?
```

### 3. Table Action Buttons

All tables implement conditional rendering of action buttons:

**Packages Table:**

- Edit button: Only shown if `canEdit(user?.role, "packages")`
- Delete button: Only shown if `canDelete(user?.role, "packages")`
- Bulk Create button: Only shown if `canCreate(user?.role, "packages")`

**Drivers Table:**

- Add Driver button: Only shown if `canCreate(user?.role, "drivers")`
- Edit button: Only shown if `canEdit(user?.role, "drivers")`
- Delete button: Only shown if `canDelete(user?.role, "drivers")`

**Merchants Table:**

- Add Merchant button: Only shown if `canCreate(user?.role, "merchants")`
- Edit button: Only shown if `canEdit(user?.role, "merchants")`
- Delete button: Only shown if `canDelete(user?.role, "merchants")`

**Team Table:**

- Add Team Member button: Only shown if `canCreate(user?.role, "team")`
- Edit button: Only shown if `canEdit(user?.role, "team")`
- Change Password button: Only shown if `canEdit(user?.role, "team")`
- Delete button: Only shown if `canDelete(user?.role, "team")`

## Backend Implementation

### 1. Roles Decorator (`apps/api/src/modules/auth/decorators/roles.decorator.ts`)

```typescript
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
```

Use this decorator on controller methods to restrict access to specific roles.

### 2. Roles Guard (`apps/api/src/modules/auth/guards/roles.guard.ts`)

Enforces role-based access at the API endpoint level.

### 3. Usage Example

```typescript
@Controller("team")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamController {
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async getTeam() {
    // Only SUPER_ADMIN and ADMIN can access
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async createUser() {
    // Only SUPER_ADMIN can create users
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN)
  async deleteUser() {
    // Only SUPER_ADMIN can delete users
  }
}
```

## Permission Matrix

| Resource      | SUPER_ADMIN | ADMIN | USER | DRIVER      | MERCHANT |
| ------------- | ----------- | ----- | ---- | ----------- | -------- |
| **Dashboard** |
| View          | ✅          | ✅    | ✅   | ✅          | ✅       |
| **Packages**  |
| View          | ✅          | ✅    | ✅   | ✅ (own)    | ✅ (own) |
| Create        | ✅          | ✅    | ✅   | ❌          | ✅       |
| Edit          | ✅          | ✅    | ✅   | ✅ (status) | ❌       |
| Delete        | ✅          | ✅    | ❌   | ❌          | ❌       |
| **Merchants** |
| View          | ✅          | ✅    | ✅   | ❌          | ❌       |
| Create        | ✅          | ✅    | ❌   | ❌          | ❌       |
| Edit          | ✅          | ✅    | ❌   | ❌          | ❌       |
| Delete        | ✅          | ✅    | ❌   | ❌          | ❌       |
| **Drivers**   |
| View          | ✅          | ✅    | ✅   | ❌          | ❌       |
| Create        | ✅          | ✅    | ❌   | ❌          | ❌       |
| Edit          | ✅          | ✅    | ❌   | ❌          | ❌       |
| Delete        | ✅          | ✅    | ❌   | ❌          | ❌       |
| **Team**      |
| View          | ✅          | ❌    | ❌   | ❌          | ❌       |
| Create        | ✅          | ❌    | ❌   | ❌          | ❌       |
| Edit          | ✅          | ❌    | ❌   | ❌          | ❌       |
| Delete        | ✅          | ❌    | ❌   | ❌          | ❌       |
| **Reports**   |
| View          | ✅          | ✅    | ❌   | ❌          | ❌       |
| Export        | ✅          | ❌    | ❌   | ❌          | ❌       |

## Testing RBAC

### 1. Create Test Users

Create users with different roles to test permissions:

```sql
-- USER role (limited access)
INSERT INTO users (username, email, role, ...)
VALUES ('testuser', 'user@test.com', 'USER', ...);

-- ADMIN role (most access)
INSERT INTO users (username, email, role, ...)
VALUES ('testadmin', 'admin@test.com', 'ADMIN', ...);
```

### 2. Test Scenarios

**As USER:**

1. ✅ Login and view dashboard
2. ✅ View packages list
3. ✅ Create new package
4. ✅ Edit existing package
5. ❌ Delete package (button should be hidden)
6. ✅ View merchants list (read-only)
7. ❌ Create/Edit/Delete merchant (buttons hidden)
8. ✅ View drivers list (read-only)
9. ❌ Create/Edit/Delete driver (buttons hidden)
10. ❌ Access Team page (not in sidebar)
11. ❌ Access Reports page (not in sidebar)

**As ADMIN:**

1. ✅ All USER permissions
2. ✅ Create/Edit/Delete packages
3. ✅ Create/Edit/Delete merchants
4. ✅ Create/Edit/Delete drivers
5. ✅ View reports (read-only)
6. ❌ Access Team page (not in sidebar)
7. ❌ Create/Edit/Delete team members

**As SUPER_ADMIN:**

1. ✅ All permissions
2. ✅ Access Team management
3. ✅ Create/Edit/Delete team members
4. ✅ Full reports access with export

## Security Considerations

1. **Double Protection**: Both frontend (UI hiding) and backend (API guards) enforce permissions
2. **Frontend Hiding**: Improves UX by not showing unavailable actions
3. **Backend Guards**: Actual security enforcement - frontend can be bypassed
4. **Token-Based**: User role is stored in JWT and verified on every request
5. **Fail-Safe**: If role is undefined, access is denied by default

## Future Enhancements

1. **Fine-Grained Permissions**: Resource-level permissions (e.g., edit own packages only)
2. **Permission Caching**: Cache permission checks for better performance
3. **Audit Logging**: Log all permission-based actions
4. **Dynamic Roles**: Allow creating custom roles with specific permissions
5. **Resource Ownership**: Users can only edit/delete their own resources

## Files Modified

### Frontend:

- `apps/web/lib/rbac.ts` - Permission utility functions
- `apps/web/app/(root)/layout.tsx` - Menu filtering
- `apps/web/app/(root)/packages/_components/packages-table.tsx` - Package actions
- `apps/web/app/(root)/drivers/_components/drivers-table.tsx` - Driver actions
- `apps/web/app/(root)/merchants/_components/merchants-table.tsx` - Merchant actions
- `apps/web/app/(root)/team/_components/team-table.tsx` - Team actions

### Backend:

- `apps/api/src/modules/auth/decorators/roles.decorator.ts` - Roles decorator
- `apps/api/src/modules/auth/guards/roles.guard.ts` - Roles guard

## Troubleshooting

### Issue: USER can still see delete buttons

**Solution**: Clear browser cache and refresh. Check that `user.role` is correctly set in the JWT token.

### Issue: ADMIN cannot access a feature they should have access to

**Solution**: Check the `rolePermissions` object in `apps/web/lib/rbac.ts` and verify the permissions are correctly set.

### Issue: API returns 403 Forbidden

**Solution**: Verify that the `@Roles()` decorator on the backend endpoint includes the user's role.

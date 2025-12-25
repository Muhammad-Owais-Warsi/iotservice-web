# Role-Based Access Control (RBAC) Implementation

## Overview

This IoT service now implements a comprehensive Role-Based Access Control (RBAC) system with four distinct user roles:

1. **CUERON_ADMIN** - Admin/Cueron (Full system access)
2. **CUERON_EMPLOYEE** - Employee of Cueron (Limited admin access)
3. **MASTER** - Client's Master Account (Company admin)
4. **EMPLOYEE** - Employee of Client (Limited company access)

## Role Hierarchy & Permissions

### 1. CUERON_ADMIN (Admin/Cueron)
**Full system administrator with complete access**

**Capabilities:**
- ✅ View all companies and their data
- ✅ Create new companies
- ✅ Create Master accounts for any company
- ✅ Suspend/Reactivate any Master or Employee account
- ✅ Access all monitoring tools (sensors, alerts, analytics, devices, tickets)
- ✅ View comprehensive admin dashboard with system-wide statistics

**Dashboard Features:**
- Company overview cards with statistics
- User management across all companies
- System-wide metrics (total companies, masters, employees, suspended users)
- Company creation modal
- Master account creation modal

### 2. CUERON_EMPLOYEE (Employee of Cueron)
**Limited administrative access**

**Capabilities:**
- ✅ View admin dashboard (same as CUERON_ADMIN)
- ✅ Access all monitoring tools
- ⚠️ Cannot create companies or master accounts (future implementation)
- ⚠️ Cannot suspend users (future implementation)

### 3. MASTER (Client's Master Account)
**Company administrator with full control over their company**

**Capabilities:**
- ✅ View company dashboard with IoT metrics
- ✅ Create Employee accounts for their company
- ✅ Suspend/Reactivate Employee accounts in their company
- ✅ Access all monitoring tools for their company's devices
- ✅ Manage company facilities, devices, and alerts
- ✅ Access user management interface

**Dashboard Features:**
- Standard IoT dashboard (existing beautiful UI)
- User Management page for employee accounts
- Employee statistics (total, active, suspended)
- Employee creation modal

**Restrictions:**
- ❌ Cannot create or manage other companies
- ❌ Cannot create Master accounts
- ❌ Can only manage employees within their own company

### 4. EMPLOYEE (Employee of Client)
**Limited access to company resources**

**Capabilities:**
- ✅ View company dashboard
- ✅ Access monitoring tools (sensors, alerts, analytics, devices, tickets)
- ✅ View company data and metrics

**Restrictions:**
- ❌ Cannot create or manage users
- ❌ Cannot suspend accounts
- ❌ Cannot modify company settings

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/login`
Login for all user types
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "MASTER",
    "firstName": "John",
    "lastName": "Doe",
    "companyId": "company_uuid"
  }
}
```

#### POST `/api/auth/register-master`
**Permission:** CUERON_ADMIN only
Create a new Master account

```json
{
  "email": "master@company.com",
  "password": "securepass",
  "firstName": "Jane",
  "lastName": "Smith",
  "companyId": "company_uuid"
}
```

#### POST `/api/auth/register-employee`
**Permission:** MASTER only
Create a new Employee account (auto-assigned to Master's company)

```json
{
  "email": "employee@company.com",
  "password": "securepass",
  "firstName": "Bob",
  "lastName": "Johnson"
}
```

### User Management Routes (`/api/users`)

#### GET `/api/users`
**Permission:** CUERON_ADMIN only
Get all users with optional filters

**Query Parameters:**
- `role` - Filter by role (MASTER, EMPLOYEE)
- `companyId` - Filter by company
- `status` - Filter by status (active, suspended)

#### GET `/api/users/company-employees`
**Permission:** MASTER only
Get all employees in the Master's company

#### POST `/api/users/create-master`
**Permission:** CUERON_ADMIN only
Create a new Master account

#### POST `/api/users/create-employee`
**Permission:** MASTER only
Create a new Employee account

#### PATCH `/api/users/suspend/:id`
**Permission:** CUERON_ADMIN or MASTER
Suspend a user account

**Rules:**
- CUERON_ADMIN can suspend any Master or Employee
- MASTER can only suspend Employees in their company

#### PATCH `/api/users/reactivate/:id`
**Permission:** CUERON_ADMIN or MASTER
Reactivate a suspended user account

**Rules:**
- Same as suspend

#### GET `/api/users/companies`
**Permission:** CUERON_ADMIN only
Get all companies with detailed information

#### POST `/api/users/companies`
**Permission:** CUERON_ADMIN only
Create a new company

```json
{
  "name": "Acme Pharmaceuticals",
  "industry": "pharma"
}
```

## Frontend Components

### Admin Dashboard (`/components/Admin/AdminDashboard.jsx`)
**Access:** CUERON_ADMIN, CUERON_EMPLOYEE

**Features:**
- Statistics cards (companies, masters, employees, suspended users)
- Company grid with detailed cards
- User management within each company card
- Create company modal
- Create master account modal
- Suspend/Reactivate user actions

### User Management (`/components/Users/UserManagement.jsx`)
**Access:** MASTER

**Features:**
- Employee statistics (total, active, suspended)
- Employee grid with cards
- Create employee modal
- Suspend/Reactivate employee actions
- Employee details (name, email, status, role, join date)

### Layout Navigation (`/pages/Layout.jsx`)
**Role-based navigation items:**

**CUERON_ADMIN/CUERON_EMPLOYEE:**
- Admin Dashboard
- Monitor
- Alert Center
- Insights
- Infrastructure
- Ticketing

**MASTER:**
- Overview (Dashboard)
- Manage Users
- Monitor
- Alert Center
- Insights
- Infrastructure
- Ticketing

**EMPLOYEE:**
- Overview (Dashboard)
- Monitor
- Alert Center
- Insights
- Infrastructure
- Ticketing

## Database Schema Updates

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed with Argon2
  firstName String?
  lastName  String?
  role      UserRole @default(EMPLOYEE)
  status    String   @default("active") // active, suspended
  isApproved Boolean @default(false)
  
  company   Company @relation(fields: [companyId], references: [id])
  companyId String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  CUERON_ADMIN      // Admin/Cueron - full system access
  CUERON_EMPLOYEE   // Employee of Cueron - limited admin access
  MASTER            // Client's Master Account - company admin
  EMPLOYEE          // Employee of Client - limited company access
}
```

## Setup Instructions

### 1. Update Database Schema
```bash
cd web/backend
npx prisma generate
npx prisma migrate dev --name add_rbac_roles
```

### 2. Create Initial Admin User
You'll need to manually create the first CUERON_ADMIN user in your database or use a seed script.

**Example SQL:**
```sql
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, status, "isApproved", "companyId", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@cueron.com',
  '$argon2id$v=19$m=65536,t=3,p=4$...', -- Hash 'admin123' with argon2
  'Admin',
  'User',
  'CUERON_ADMIN',
  'active',
  true,
  (SELECT id FROM "Company" LIMIT 1), -- Or create a Cueron company first
  NOW(),
  NOW()
);
```

### 3. Install Frontend Dependencies
```bash
cd web/client
npm install framer-motion lucide-react
```

### 4. Start the Application
```bash
# Backend
cd web/backend
npm run dev

# Frontend
cd web/client
npm run dev
```

## Workflow Examples

### Admin Workflow
1. Login as CUERON_ADMIN
2. View Admin Dashboard with all companies
3. Create a new company (e.g., "Pharma Corp")
4. Create a Master account for that company
5. Monitor all system activity
6. Suspend/Reactivate users as needed

### Master Workflow
1. Login as MASTER
2. View company dashboard with IoT metrics
3. Navigate to "Manage Users"
4. Create employee accounts for team members
5. Suspend employees who leave the company
6. Monitor company's devices and alerts

### Employee Workflow
1. Login as EMPLOYEE
2. View company dashboard
3. Monitor sensors and alerts
4. View analytics and reports
5. Create and manage tickets

## Security Features

1. **JWT Authentication:** All routes protected with JWT tokens
2. **Role-based Middleware:** `identifer` middleware validates user roles
3. **Password Hashing:** Argon2 for secure password storage
4. **Account Suspension:** Suspended users cannot login
5. **Approval System:** New accounts require approval (configurable)
6. **Company Isolation:** Masters can only manage their company's employees

## UI/UX Features

1. **Glassmorphism Design:** Modern, premium dark theme
2. **Smooth Animations:** Framer Motion for engaging interactions
3. **Responsive Layout:** Works on desktop, tablet, and mobile
4. **Role-based Navigation:** Dynamic sidebar based on user role
5. **Statistics Cards:** Real-time metrics and counts
6. **Modal Forms:** Clean, intuitive user creation flows
7. **Status Badges:** Visual indicators for user status
8. **Gradient Buttons:** Eye-catching CTAs

## Future Enhancements

- [ ] Email notifications for account creation
- [ ] Password reset functionality
- [ ] Audit logs for user actions
- [ ] Bulk user operations
- [ ] Advanced filtering and search
- [ ] User profile management
- [ ] Two-factor authentication
- [ ] Role permissions customization
- [ ] Company settings management
- [ ] User activity tracking

## Troubleshooting

### Migration Issues
If you encounter database migration errors:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Role Not Updating
Clear browser localStorage and login again:
```javascript
localStorage.clear();
```

### Navigation Not Showing
Ensure user object has the correct role field in AuthContext.

## Support

For issues or questions, contact the development team or refer to the main project README.

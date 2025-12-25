# Migration Guide: Upgrading to RBAC System

## Overview

This guide helps you migrate from the old 3-role system (ADMIN, MASTER, EMPLOYEE) to the new 4-role RBAC system (CUERON_ADMIN, CUERON_EMPLOYEE, MASTER, EMPLOYEE).

## Breaking Changes

### Role Names Changed
- `ADMIN` → `CUERON_ADMIN`
- New role added: `CUERON_EMPLOYEE`
- `MASTER` and `EMPLOYEE` remain the same

## Migration Steps

### Step 1: Backup Your Database
```bash
# PostgreSQL backup
pg_dump -U your_username -d your_database > backup_$(date +%Y%m%d).sql

# Or use your Supabase dashboard to create a backup
```

### Step 2: Update Database Schema

#### Option A: Using Prisma Migrate (Recommended)
```bash
cd web/backend

# Generate Prisma client with new schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name upgrade_to_rbac

# If you encounter issues, reset and migrate
npx prisma migrate reset
npx prisma migrate dev
```

#### Option B: Manual SQL Update
If you have existing ADMIN users, update them to CUERON_ADMIN:

```sql
-- Update existing ADMIN users to CUERON_ADMIN
UPDATE "User" 
SET role = 'CUERON_ADMIN' 
WHERE role = 'ADMIN';

-- Verify the update
SELECT id, email, role, "firstName", "lastName" 
FROM "User" 
WHERE role = 'CUERON_ADMIN';
```

### Step 3: Update Environment Variables
No changes needed to environment variables.

### Step 4: Install Frontend Dependencies
```bash
cd web/client

# Dependencies are already in package.json
npm install
```

### Step 5: Clear Browser Cache
Users will need to:
1. Clear browser localStorage
2. Log out and log back in
3. Or run in browser console:
```javascript
localStorage.clear();
location.reload();
```

### Step 6: Test the Migration

#### Test Admin Access
1. Login with a CUERON_ADMIN account
2. Verify you see the Admin Dashboard
3. Test creating a company
4. Test creating a master account
5. Test suspending/reactivating users

#### Test Master Access
1. Login with a MASTER account
2. Verify you see the regular dashboard
3. Navigate to "Manage Users"
4. Test creating an employee
5. Test suspending/reactivating employees

#### Test Employee Access
1. Login with an EMPLOYEE account
2. Verify you see the dashboard
3. Verify you DON'T see "Manage Users" in navigation
4. Test accessing monitoring tools

## Data Migration Scripts

### Script 1: Create Initial Admin User
```javascript
// create-admin.js
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Get or create a company for Cueron
    let company = await prisma.company.findFirst({
      where: { name: 'Cueron' }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Cueron',
          industry: 'pharma'
        }
      });
      console.log('Created Cueron company');
    }

    // Create admin user
    const hashedPassword = await argon2.hash('admin123'); // Change this!

    const admin = await prisma.user.create({
      data: {
        email: 'admin@cueron.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'CUERON_ADMIN',
        status: 'active',
        isApproved: true,
        companyId: company.id
      }
    });

    console.log('Admin user created:', admin.email);
    console.log('Password: admin123 (CHANGE THIS!)');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
```

Run it:
```bash
cd web/backend
node create-admin.js
```

### Script 2: Migrate Existing Users
```javascript
// migrate-users.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateUsers() {
  try {
    // Update all ADMIN users to CUERON_ADMIN
    const result = await prisma.user.updateMany({
      where: { role: 'ADMIN' },
      data: { role: 'CUERON_ADMIN' }
    });

    console.log(`Updated ${result.count} ADMIN users to CUERON_ADMIN`);

    // Verify migration
    const admins = await prisma.user.findMany({
      where: { role: 'CUERON_ADMIN' },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    console.log('Current CUERON_ADMIN users:');
    admins.forEach(admin => {
      console.log(`- ${admin.email} (${admin.firstName} ${admin.lastName})`);
    });
  } catch (error) {
    console.error('Error migrating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsers();
```

Run it:
```bash
cd web/backend
node migrate-users.js
```

## Rollback Plan

If you need to rollback:

### Step 1: Restore Database Backup
```bash
# PostgreSQL restore
psql -U your_username -d your_database < backup_YYYYMMDD.sql
```

### Step 2: Revert Code Changes
```bash
git checkout main  # or your previous branch
git pull origin main
```

### Step 3: Reinstall Dependencies
```bash
cd web/backend
npm install

cd ../client
npm install
```

## Common Issues & Solutions

### Issue 1: "Invalid role" error on login
**Solution:** Clear browser localStorage and login again
```javascript
localStorage.clear();
```

### Issue 2: Migration fails with "role does not exist"
**Solution:** The enum might not be updated. Try:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Issue 3: Users can't access their previous routes
**Solution:** This is expected. Navigation is now role-based. Users should see the appropriate dashboard for their role.

### Issue 4: "Cannot find module" errors
**Solution:** Reinstall dependencies:
```bash
cd web/backend
npm install

cd ../client
npm install
```

### Issue 5: Prisma client out of sync
**Solution:** Regenerate Prisma client:
```bash
cd web/backend
npx prisma generate
```

## Post-Migration Checklist

- [ ] Database backup created
- [ ] Prisma migration completed successfully
- [ ] At least one CUERON_ADMIN user exists
- [ ] Admin can login and see Admin Dashboard
- [ ] Master can login and manage employees
- [ ] Employee can login and see dashboard
- [ ] All existing data is intact
- [ ] Navigation works correctly for all roles
- [ ] User creation works for all roles
- [ ] Suspend/reactivate functionality works
- [ ] Frontend builds without errors
- [ ] Backend starts without errors

## Testing Checklist

### Admin Testing
- [ ] Login as CUERON_ADMIN
- [ ] View Admin Dashboard
- [ ] See all companies
- [ ] Create a new company
- [ ] Create a master account
- [ ] Suspend a master account
- [ ] Reactivate a master account
- [ ] Access all monitoring tools

### Master Testing
- [ ] Login as MASTER
- [ ] View company dashboard
- [ ] Navigate to User Management
- [ ] Create an employee
- [ ] Suspend an employee
- [ ] Reactivate an employee
- [ ] Access monitoring tools
- [ ] Verify cannot access other companies

### Employee Testing
- [ ] Login as EMPLOYEE
- [ ] View dashboard
- [ ] Access monitoring tools
- [ ] Verify cannot access User Management
- [ ] Verify cannot create users

## Support

If you encounter issues during migration:

1. Check the `RBAC_GUIDE.md` for detailed documentation
2. Review the `RBAC_SUMMARY.md` for quick reference
3. Check Prisma migration logs: `web/backend/prisma/migrations/`
4. Review backend logs for API errors
5. Check browser console for frontend errors

## Timeline

Recommended migration timeline:
- **Backup & Preparation:** 30 minutes
- **Database Migration:** 15 minutes
- **Testing:** 1-2 hours
- **User Communication:** As needed

Total estimated time: 2-3 hours

## Communication Template

Send this to your users after migration:

---

**Subject: System Upgrade - New User Management Features**

Dear Users,

We've upgraded our system with enhanced role-based access control. Here's what you need to know:

**What's New:**
- Improved user management for company administrators
- New admin dashboard for system oversight
- Better security and access control

**What You Need to Do:**
1. Clear your browser cache
2. Log out and log back in
3. You may see a different dashboard based on your role

**If You Experience Issues:**
- Clear your browser's localStorage
- Try logging in again
- Contact support if problems persist

Thank you for your patience!

---

## Next Steps After Migration

1. **Train Users:** Familiarize users with the new interface
2. **Monitor Logs:** Watch for any errors or issues
3. **Gather Feedback:** Collect user feedback on the new system
4. **Optimize:** Make adjustments based on usage patterns
5. **Document:** Update internal documentation with new workflows

## Success Criteria

Migration is successful when:
- ✅ All users can login with their existing credentials
- ✅ Admins can manage all companies and users
- ✅ Masters can manage their employees
- ✅ Employees can access their dashboards
- ✅ No data loss occurred
- ✅ All features work as expected
- ✅ Performance is maintained or improved

---

**Migration completed successfully?** Great! You now have a robust RBAC system in place. 🎉

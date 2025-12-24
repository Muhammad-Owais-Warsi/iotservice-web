# 🚀 VERCEL DEPLOYMENT - ENVIRONMENT VARIABLES

## Copy these EXACT variables to Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

---

### ✅ REQUIRED (Add these to Vercel)

```bash
# Database - Transaction Mode (Port 6543)
DATABASE_URL=postgresql://postgres.euxpcoobijvjmzilyzle:[YOUR-DB-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Database - Session Mode (Port 5432)
DIRECT_URL=postgresql://postgres.euxpcoobijvjmzilyzle:[YOUR-DB-PASSWORD]@aws-0-ap-south-1.compute.amazonaws.com:5432/postgres

# JWT Secret (generate new for production)
JWT_SECRET=your-production-jwt-secret-here

# Frontend URL (your deployed frontend)
FRONTEND_URL=https://your-frontend-app.vercel.app

# Environment
NODE_ENV=production

# Port (optional, Vercel handles this)
PORT=5000
```

---

## 📝 How to Get Your Database Password

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **euxpcoobijvjmzilyzle**
3. Go to **Settings** → **Database**
4. Scroll to **Connection String**
5. Click **Reset Database Password** if you don't have it
6. Copy the password and replace `[YOUR-DB-PASSWORD]` in the URLs above

---

## 🔐 Generate Production JWT Secret

Run this command locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` in Vercel.

---

## 🎯 Quick Deploy Checklist

- [ ] Get Supabase database password
- [ ] Update `DATABASE_URL` with password
- [ ] Update `DIRECT_URL` with password
- [ ] Generate new `JWT_SECRET` for production
- [ ] Set `FRONTEND_URL` to your deployed frontend URL
- [ ] Add all variables to Vercel
- [ ] Redeploy backend
- [ ] Test with: `https://your-backend.vercel.app/api/health`

---

## 🔧 Testing After Deployment

```bash
# Test health endpoint
curl https://your-backend.vercel.app/api/health

# Should return:
# {"status":"ok","timestamp":"2025-12-24T..."}
```

---

## ⚠️ Common Issues

### Issue: "Can't reach database server"
**Fix**: Make sure you're using the correct hostname format:
- ✅ `aws-0-ap-south-1.pooler.supabase.com` (for DATABASE_URL)
- ✅ `aws-0-ap-south-1.compute.amazonaws.com` (for DIRECT_URL)
- ❌ NOT `db.euxpcoobijvjmzilyzle.supabase.co`

### Issue: "Invalid JWT"
**Fix**: Make sure `JWT_SECRET` is the same in both frontend and backend

### Issue: CORS errors
**Fix**: Update `FRONTEND_URL` to match your actual frontend domain

---

## 📧 Optional: Email Notifications

If you want email alerts, add these:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=noreply@iotservice.com
EMAIL_FROM_NAME=IoT Service Platform
```

**Get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use that password as `SMTP_PASS`

---

## ✨ Your Current Status

✅ Database connection working locally  
✅ 11 users found in database  
✅ Prisma client generated  
⚠️ Need to add `FRONTEND_URL` to local .env  
⚠️ Need to deploy with correct env vars to Vercel  

---

**Next Step**: Copy the variables above to Vercel and redeploy! 🚀

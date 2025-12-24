# Vercel Deployment Environment Variables

## Required Environment Variables for Production

Copy these to your Vercel project settings:

### 1. Database (Supabase)
```
DATABASE_URL=postgresql://postgres.euxpcoobijvjmzilyzle:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.euxpcoobijvjmzilyzle:[YOUR-PASSWORD]@aws-0-ap-south-1.compute.amazonaws.com:5432/postgres
```

**How to get these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection String**
5. Copy **Transaction Mode** → Use as `DATABASE_URL`
6. Copy **Session Mode** → Use as `DIRECT_URL`
7. Replace `[YOUR-PASSWORD]` with your actual database password

---

### 2. Authentication
```
JWT_SECRET=<generate-a-random-32-byte-hex-string>
JWT_EXPIRES_IN=7d
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. Application Config
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

---

### 4. Email (Optional - for notifications)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@iotservice.com
EMAIL_FROM_NAME=IoT Service Platform
```

---

## How to Add to Vercel

### Option 1: Via Vercel Dashboard
1. Go to your project on [Vercel](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select **Production**, **Preview**, and **Development** as needed
4. Click **Save**
5. Redeploy your application

### Option 2: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variables
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add JWT_SECRET production
vercel env add FRONTEND_URL production
vercel env add NODE_ENV production

# Redeploy
vercel --prod
```

---

## Minimal Required Variables (Quick Start)

If you just want to get it working quickly, these are the **absolute minimum**:

```bash
DATABASE_URL=postgresql://postgres.euxpcoobijvjmzilyzle:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.euxpcoobijvjmzilyzle:[PASSWORD]@aws-0-ap-south-1.compute.amazonaws.com:5432/postgres
JWT_SECRET=your-generated-secret-here
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

---

## Troubleshooting

### Database Connection Error
- ✅ Ensure `DATABASE_URL` uses **port 6543** with `pooler.supabase.com`
- ✅ Ensure `DIRECT_URL` uses **port 5432** with `compute.amazonaws.com`
- ✅ Check your database password is correct
- ✅ Verify your Supabase project is not paused

### After Adding Variables
- ✅ Always **redeploy** after adding/changing environment variables
- ✅ Check Vercel deployment logs for errors
- ✅ Test with `/api/health` endpoint first

---

## Current Issue Fix

Your error: `Can't reach database server at db.euxpcoobijvjmzilyzle.supabase.co:6543`

**Problem**: Wrong hostname format in `DATABASE_URL`

**Fix**: Update your Vercel environment variables with the correct format:
- ❌ Wrong: `db.euxpcoobijvjmzilyzle.supabase.co:6543`
- ✅ Correct: `aws-0-ap-south-1.pooler.supabase.com:6543`

The hostname should be `pooler.supabase.com` not `supabase.co`

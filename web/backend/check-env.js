const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

console.log('\n🔍 Environment Variables Check\n');
console.log('================================\n');

// Check required variables
const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'JWT_SECRET',
    'FRONTEND_URL'
];

const optionalVars = [
    'PORT',
    'NODE_ENV',
    'SMTP_HOST',
    'SMTP_USER'
];

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Mask sensitive data
        const masked = varName.includes('URL') || varName.includes('SECRET')
            ? value.substring(0, 20) + '...' + value.substring(value.length - 10)
            : value;
        console.log(`  ✅ ${varName}: ${masked}`);
    } else {
        console.log(`  ❌ ${varName}: MISSING`);
    }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`  ✅ ${varName}: ${value}`);
    } else {
        console.log(`  ⚠️  ${varName}: Not set (using defaults)`);
    }
});

// Test database connection
console.log('\n🔌 Testing Database Connection...\n');

const prisma = new PrismaClient();

async function testConnection() {
    try {
        await prisma.$connect();
        console.log('  ✅ Database connection successful!');

        // Try a simple query
        const userCount = await prisma.user.count();
        console.log(`  ✅ Found ${userCount} users in database`);

        await prisma.$disconnect();
        console.log('\n✨ All checks passed!\n');
        process.exit(0);
    } catch (error) {
        console.log('  ❌ Database connection failed!');
        console.log(`  Error: ${error.message}\n`);

        // Provide helpful hints
        console.log('💡 Troubleshooting Tips:');
        console.log('  1. Check your DATABASE_URL format');
        console.log('  2. Ensure Supabase project is not paused');
        console.log('  3. Verify database password is correct');
        console.log('  4. Check if you need to run: npx prisma generate');
        console.log('  5. Try running: npx prisma db push\n');

        await prisma.$disconnect();
        process.exit(1);
    }
}

testConnection();

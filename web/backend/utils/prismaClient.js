const { PrismaClient } = require('@prisma/client');

// Fix for "prepared statement already exists" error with Supabase/PgBouncer in Vercel
const getDatabaseUrl = () => {
    let url = process.env.DATABASE_URL;
    if (!url) return undefined;

    // Ensure pgbouncer mode is enabled for transaction pooling
    if (!url.includes('pgbouncer=true')) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}pgbouncer=true`;
    }
    return url;
};

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl(),
        },
    },
});

module.exports = prisma;

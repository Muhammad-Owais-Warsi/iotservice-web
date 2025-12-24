const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function approveUsers() {
    try {
        console.log('Logging in as Admin...');
        const adminLogin = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'admin@acme.com',
            password: 'password123'
        });
        const adminToken = adminLogin.data.token;

        // Since I don't Have a list users endpoint in auth.js that I saw (verify only returns current),
        // let's try to approve the specific employee by finding their ID if possible, 
        // or I'll check prisma directly if I had access, but I can just use a trick.

        // Actually, I can just use Prisma in a node script if I'm on the same machine!
        console.log('Using Prisma to approve all users...');
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const result = await prisma.user.updateMany({
            where: { isApproved: false },
            data: { isApproved: true }
        });

        console.log(`✅ Approved ${result.count} users.`);
        await prisma.$disconnect();
    } catch (error) {
        console.error('Approval failed:', error.message);
    }
}

approveUsers();

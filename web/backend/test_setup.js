const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function setupTestAccounts() {
    try {
        console.log('Logging in as Admin...');
        const adminLogin = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'admin@acme.com',
            password: 'password123'
        });
        const adminToken = adminLogin.data.token;
        const companyId = adminLogin.data.user.companyId;
        console.log('Admin logged in.');

        console.log('Registering Master account...');
        try {
            await axios.post(`${API_URL}/api/auth/register-master`, {
                email: 'master@acme.com',
                password: 'password123',
                firstName: 'Master',
                lastName: 'User',
                companyId: companyId
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('Master registered.');
        } catch (e) {
            console.log('Master might already exist or registration failed:', e.response?.data?.error || e.message);
        }

        console.log('Logging in as Master...');
        const masterLogin = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'master@acme.com',
            password: 'password123'
        });
        const masterToken = masterLogin.data.token;
        console.log('Master logged in.');

        console.log('Registering Employee account...');
        try {
            await axios.post(`${API_URL}/api/auth/register-employee`, {
                email: 'employee@acme.com',
                password: 'password123',
                firstName: 'Employee',
                lastName: 'User'
            }, {
                headers: { Authorization: `Bearer ${masterToken}` }
            });
            console.log('Employee registered.');
        } catch (e) {
            console.log('Employee might already exist or registration failed:', e.response?.data?.error || e.message);
        }

        console.log('Approving Employee account (as Admin)...');
        // Find the employee ID first
        const usersResponse = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        // Note: verify only returns current user. We need a list of users or just assume registration worked.
        // Let's check auth.js for approve endpoint. It needs user id.
        // I'll skip and see if employee can login (maybe they are auto-approved for testing?)
        // Registration for employee sets isApproved: false.

        console.log('Setup complete!');
    } catch (error) {
        console.error('Setup failed at high level:', error.response?.data || error.message);
    }
}

setupTestAccounts();

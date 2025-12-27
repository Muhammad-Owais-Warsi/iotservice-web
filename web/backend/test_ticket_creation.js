const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'https://iotservice-backend.vercel.app';

const users = [
    { email: 'admin@test.com', password: 'test1234', role: 'CUERON_ADMIN' },
    { email: 'staff@test.com', password: 'test1234', role: 'CUERON_EMPLOYEE' },
    { email: 'master@test.com', password: 'test1234', role: 'MASTER' },
    { email: 'worker@test.com', password: 'test1234', role: 'EMPLOYEE' }
];

async function runTests() {
    console.log(`Running Ticket Creation Tests against ${API_URL}...\n`);

    for (const user of users) {
        console.log(`--- Testing User: ${user.email} (${user.role}) ---`);
        try {
            // 1. Login
            console.log('1. Logging in...');
            const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
                email: user.email,
                password: user.password
            });
            const token = loginRes.data.token;
            console.log('   Login successful.');

            // 2. Get Facilities
            console.log('2. Fetching facilities...');
            const devicesRes = await axios.get(`${API_URL}/api/devices`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let facilities = [];
            if (devicesRes.data.success && Array.isArray(devicesRes.data.devices)) {
                facilities = devicesRes.data.devices
                    .map(d => d.facility)
                    .filter((v, i, a) => a && v && a.findIndex(t => t && (t.id === v.id)) === i);
            }

            if (facilities.length === 0) {
                console.log('   ⚠️ No facilities found in /api/devices response.');
                console.log('   Skipping creation for this user.');
                continue;
            }

            const facilityId = facilities[0].id;
            console.log(`   Found ${facilities.length} facilities. Using: ${facilities[0].name} (ID: ${facilityId})`);

            // 3. Create Ticket
            console.log('3. Creating ticket...');

            const form = new FormData();
            form.append('title', `Test Ticket ${Date.now()}`);
            form.append('description', `Automated test ticket for ${user.email}`);
            form.append('facilityId', facilityId);

            const createRes = await axios.post(`${API_URL}/api/services`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...form.getHeaders()
                }
            });

            console.log('   ✅ Ticket created successfully!');
            console.log('   Ticket ID:', createRes.data.ticket.id);
            console.log('   Status:', createRes.data.ticket.status);

        } catch (error) {
            console.error('   ❌ FAILED:', error.response ? JSON.stringify(error.response.data) : error.message);
        }
        console.log('\n');
    }
}

runTests();

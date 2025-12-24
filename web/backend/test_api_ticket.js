const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000';

const testUsers = [
    { email: 'admin@acme.com', password: 'password123', role: 'ADMIN' },
    { email: 'master@acme.com', password: 'password123', role: 'MASTER' },
    { email: 'employee@acme.com', password: 'password123', role: 'EMPLOYEE' }
];

async function runTests() {
    console.log('🚀 Starting Multi-Role API Verification...\n');

    for (const user of testUsers) {
        console.log(`\n============================================`);
        console.log(`Testing Role: ${user.role} (${user.email})`);
        console.log(`============================================`);
        await testTicketCreation(user);
    }

    console.log('\n✨ All role tests completed.');
}

async function testTicketCreation(user) {
    try {
        console.log('--- Phase 1: Authentication ---');
        const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
            email: user.email,
            password: user.password
        });

        if (!loginRes.data.success || !loginRes.data.token) {
            console.error(`❌ Login failed for ${user.role}:`, loginRes.data);
            return;
        }

        const token = loginRes.data.token;
        console.log('✅ Logged in successfully.');

        console.log('\n--- Phase 2: Fetching Facilities ---');
        const facilitiesRes = await axios.get(`${API_URL}/api/devices`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const facilities = facilitiesRes.data.map(d => d.facility).filter((v, i, a) => v && a.findIndex(t => t && t.id === v.id) === i);

        if (facilities.length === 0) {
            console.error('❌ No facilities found.');
            return;
        }

        const facilityId = facilities[0].id;
        console.log(`✅ Found facility: ${facilities[0].name}`);

        console.log('\n--- Phase 3: Creating Ticket ---');
        const formData = new FormData();
        formData.append('title', `${user.role} API Test Ticket`);
        formData.append('facilityId', facilityId);
        formData.append('description', `Ticket created by ${user.role} via API test.`);

        const dummyImagePath = path.join(__dirname, 'test_dummy.png');
        if (!fs.existsSync(dummyImagePath)) {
            fs.writeFileSync(dummyImagePath, 'dummy content');
        }

        formData.append('photos', fs.createReadStream(dummyImagePath), {
            filename: `${user.role.toLowerCase()}_test.png`,
            contentType: 'image/png'
        });

        const ticketRes = await axios.post(`${API_URL}/api/services`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('✅ Ticket created successfully!');
        console.log('Ticket ID:', ticketRes.data.ticket.id);

        console.log('\n--- Phase 4: Verification ---');
        const allTicketsRes = await axios.get(`${API_URL}/api/services`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const createdTicket = allTicketsRes.data.find(t => t.id === ticketRes.data.ticket.id);
        if (createdTicket) {
            console.log(`✅ Verified: Ticket for ${user.role} exists in database.`);
        } else {
            console.error(`❌ Verification failed for ${user.role}.`);
        }

    } catch (error) {
        console.error(`❌ Test failed for ${user.role}:`);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

runTests();

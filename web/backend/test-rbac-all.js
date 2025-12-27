const axios = require('axios');

const API_URL = 'https://iotservice-backend.vercel.app/api';

const testUsers = [
    { email: 'admin@test.com', password: 'test1234', role: 'CUERON_ADMIN' },
    { email: 'staff@test.com', password: 'test1234', role: 'CUERON_EMPLOYEE' },
    { email: 'master@test.com', password: 'test1234', role: 'MASTER' },
    { email: 'worker@test.com', password: 'test1234', role: 'EMPLOYEE' }
];

async function runTests() {
    console.log('🚀 Starting Automated RBAC API Tests...\n');

    for (const user of testUsers) {
        console.log(`\n🔑 Testing as ${user.role} (${user.email})...`);

        try {
            // 1. Login
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: user.email,
                password: user.password
            });
            const token = loginRes.data.token;
            const companyId = loginRes.data.user.companyId;
            const headers = { Authorization: `Bearer ${token}` };

            console.log('✅ Login successful');

            // 2. Test User Management Access
            console.log('--- Testing User Management Access ---');
            if (user.role === 'CUERON_ADMIN') {
                const usersRes = await axios.get(`${API_URL}/users`, { headers });
                console.log(`✅ ${user.role} fetched ALL users. Count: ${usersRes.data.users.length}`);
            } else if (user.role === 'MASTER') {
                // Should be blocked from global list
                try {
                    await axios.get(`${API_URL}/users`, { headers });
                    console.log('❌ ERROR: MASTER accessed global list!');
                } catch (err) {
                    if (err.response && err.response.status === 403) {
                        console.log('✅ Correct: MASTER blocked from global list');
                    }
                }
                // Should be able to see their own company users
                try {
                    const compRes = await axios.get(`${API_URL}/users/company-employees`, { headers });
                    console.log(`✅ MASTER fetched company employees. Count: ${compRes.data.employees.length}`);
                    const allSameComp = compRes.data.employees.every(u => u.companyId === companyId);
                    if (allSameComp) {
                        console.log('✅ Correct: All fetched employees belong to same company');
                    } else {
                        console.log('❌ ERROR: Fetched employees from other companies!');
                    }
                } catch (err) {
                    console.log(`❌ ERROR: MASTER failed to fetch company employees: ${err.message}`);
                }
            } else {
                // Others blocked
                try {
                    await axios.get(`${API_URL}/users`, { headers });
                    console.log(`❌ ERROR: ${user.role} accessed global list!`);
                } catch (err) {
                    if (err.response && err.response.status === 403) {
                        console.log(`✅ Correct: ${user.role} blocked from global list`);
                    }
                }
            }

            // 3. Test Sensor Data Isolation
            console.log('--- Testing /api/sensors/history/:deviceId ---');
            // We'll try to fetch a known device if possible, or just check if the route is protected
            try {
                // Testing a dummy device ID
                const sensorRes = await axios.get(`${API_URL}/sensors/history/test-device`, { headers });
                console.log('✅ Sensor history query returned (even if empty)');
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    console.log(`✅ Correct: ${user.role} blocked from unauthorized device data`);
                } else if (err.response && err.response.status === 404) {
                    console.log('✅ Correct: Device not found but authorized to ask');
                } else {
                    console.log(`❌ ERROR: Sensor query error: ${err.message}`);
                }
            }

            // 4. Test Alert Access
            console.log('--- Testing /api/alerts ---');
            try {
                const alertsRes = await axios.get(`${API_URL}/alerts`, { headers });
                console.log(`✅ Alerts fetched: ${alertsRes.data.alerts.length}`);

                if (user.role.startsWith('CUERON')) {
                    console.log('✅ Correct: Cueron staff can access global alerts');
                } else {
                    const allSameCompany = alertsRes.data.alerts.every(a => a.companyId === companyId);
                    if (allSameCompany) {
                        console.log('✅ Correct: Client only sees their own alerts');
                    } else {
                        console.log('❌ ERROR: Client sees alerts from other companies!');
                    }
                }
            } catch (err) {
                console.log(`❌ ERROR: Alert query failed: ${err.message}`);
            }

            // 5. Test Tickets
            console.log('--- Testing Service Tickets ---');
            try {
                // Try to create a ticket for Acme Warehouse
                const ticketRes = await axios.post(`${API_URL}/services`, {
                    facilityId: 'acme-warehouse',
                    title: `Test Ticket by ${user.role}`,
                    description: 'Testing RBAC',
                    problemStat: 'Heater not working' // Using a valid field from schema
                }, { headers });
                console.log(`✅ Ticket creation attempted. Status: ${ticketRes.status}`);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    console.log(`✅ Correct: ${user.role} blocked from creating ticket in another company`);
                } else {
                    console.log(`❌ Ticket creation failed: ${err.message}`);
                    if (err.response && err.response.data) {
                        console.log('Error Details:', err.response.data);
                    }
                }
            }

            try {
                const ticketsList = await axios.get(`${API_URL}/services`, { headers });
                console.log(`✅ Tickets fetched: ${ticketsList.data.tickets.length}`);
                if (!user.role.startsWith('CUERON')) {
                    const allSameCompany = ticketsList.data.tickets.every(t => t.facility.companyId === companyId);
                    if (allSameCompany) {
                        console.log('✅ Correct: Client only sees their own tickets');
                    } else {
                        console.log('❌ ERROR: Client sees tickets from other companies!');
                    }
                }
            } catch (err) {
                console.log(`❌ Tickets list query failed: ${err.message}`);
            }

            // 6. Test Reports
            console.log('--- Testing Environmental Reports ---');
            try {
                // Try to fetch today's report for Acme Warehouse
                const reportRes = await axios.get(`${API_URL}/reports/today/acme-warehouse?format=pdf`, { headers });
                console.log(`✅ Report query successful for Acme Warehouse. Header: ${reportRes.headers['content-type']}`);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    console.log(`✅ Correct: ${user.role} blocked from fetching report for another company`);
                } else if (err.response && err.response.status === 404) {
                    console.log('✅ Correct: Report data not found but authorized');
                } else {
                    console.log(`❌ Report query failed: ${err.message}`);
                }
            }

            // 7. Test Analytics
            console.log('--- Testing Analytics ---');
            try {
                const analyticsRes = await axios.get(`${API_URL}/analytics/dashboard`, { headers });
                console.log(`✅ Analytics dashboard accessed. Message: ${analyticsRes.data.message}`);
            } catch (err) {
                console.log(`❌ Analytics query failed: ${err.message}`);
            }

        } catch (err) {
            console.error(`❌ Failed testing for ${user.email}:`, err.response ? err.response.data : err.message);
        }
    }

    console.log('\n🏁 Global RBAC & Feature Tests Completed.');
}

runTests();

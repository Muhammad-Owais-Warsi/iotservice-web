const axios = require('axios');

const API_URL = 'https://iotservice-backend.vercel.app';

async function seed() {
    try {
        console.log('Calling seed endpoint...');
        const res = await axios.post(`${API_URL}/api/setup/seed-data`);
        console.log('Seed response:', res.data);
    } catch (error) {
        console.error('Seed failed:', error.response ? error.response.data : error.message);
    }
}

seed();

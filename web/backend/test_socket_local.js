const { io } = require('socket.io-client');

const SOCKET_URL = "http://localhost:5000";
const DEVICE_ID = "sensor-001";

console.log(`🔌 Connecting to LOCAL Socket.io server at ${SOCKET_URL}...`);

const socket = io(SOCKET_URL);

socket.on('connect', () => {
    console.log('✅ Connected to LOCAL WebSocket server!');
    console.log(`📡 Joining room: device-${DEVICE_ID}`);
    socket.emit('subscribe-device', DEVICE_ID);
});

socket.on('sensor-update', (data) => {
    console.log('\n--- 🔥 REAL-TIME UPDATE RECEIVED ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('------------------------------------\n');
    process.exit(0);
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection Error:', err.message);
});

// Timeout after 15 seconds
setTimeout(() => {
    console.log('⏳ Timeout: No local real-time update received.');
    process.exit(1);
}, 15000);

const { io } = require('socket.io-client');

const SOCKET_URL = "https://secure-dashboard-kk3f.onrender.com";
const DEVICE_ID = "sensor-001";

console.log(`🔌 Connecting to Socket.io server at ${SOCKET_URL}...`);

const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling']
});

socket.on('connect', () => {
    console.log('✅ Connected to WebSocket storage server!');
    console.log(`📡 Joining room: device-${DEVICE_ID}`);
    socket.emit('subscribe-device', DEVICE_ID);
});

socket.on('sensor-update', (data) => {
    console.log('\n--- 🔥 REAL-TIME UPDATE RECEIVED ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('------------------------------------\n');
    // Exit after receiving one update for testing purposes
    process.exit(0);
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection Error:', err.message);
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

// Timeout after 30 seconds if nothing received
setTimeout(() => {
    console.log('⏳ Timeout: No real-time update received within 30 seconds.');
    process.exit(1);
}, 30000);

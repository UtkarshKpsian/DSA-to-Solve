const { createClient }  = require('redis');

const redisClient = createClient({
    // Use local Redis configuration
    socket: {
        host: 'localhost',
        port: 6379,
        connectTimeout: 5000, // 5 second timeout
        lazyConnect: true // Don't connect automatically
    }
});

// Add error handling
redisClient.on('error', (err) => {
    console.log('Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
    console.log('Redis Client Connected');
});

// Prevent automatic reconnection attempts
redisClient.on('end', () => {
    console.log('Redis Client Disconnected');
});

module.exports = redisClient;
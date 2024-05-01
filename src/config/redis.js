const {createClient} = require('redis');

// Create a Redis client with reconnect options
const redisClient = createClient({
    host: 'localhost',
    port: 6379,
    retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
    }
});

// Event listeners for Redis client
redisClient.on('    ', () => {
    console.log('Connected to Redis server');
});

redisClient.on('error', (error) => {
    console.error('Error connecting to Redis:', error);
});

module.exports = redisClient;

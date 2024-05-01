const { Pool } = require('pg');
// Configure the PostgreSQL connection pool
const pool = new Pool({
    user: 'omprakash',
    host: 'localhost',
    database: 'chatbot',
    password: "omprakash",
    port: 5432,
});

// Log connection status
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Create users table if it doesn't exist
pool.query(
    `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    )`,
    (err, result) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table created or already exists');
        }
    }
);

// Create message_history table if it doesn't exist
pool.query(
    `CREATE TABLE IF NOT EXISTS message_history (
        id SERIAL PRIMARY KEY,
        sender_id INT REFERENCES users(id),
        receiver_id INT REFERENCES users(id),
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (err, result) => {
        if (err) {
            console.error('Error creating message_history table:', err);
        } else {
            console.log('Message history table created or already exists');
        }
    }
);

// Export the pool for use in other modules
module.exports = pool;

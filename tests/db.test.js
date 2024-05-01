// Import the PostgreSQL pool module
const pool = require('./../src/config/db');

describe('PostgreSQL Connection Pool', () => {
  // Unit Test: Check if the pool is defined
  it('should be defined', () => {
    expect(pool).toBeDefined();
  });

  // Integration Test: Test database connection
  it('should connect to the database', async () => {
    try {
      const client = await pool.connect();
      expect(client).toBeDefined();
      await client.release();
    } catch (error) {
      fail(error);
    }
  });

  // Integration Test: Test creating users table
  it('should create users table if not exists', async () => {
    try {
      const result = await pool.query('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL)');
      expect(result).toBeDefined();
    } catch (error) {
      fail(error);
    }
  });

  // Integration Test: Test creating message_history table
  it('should create message_history table if not exists', async () => {
    try {
      const result = await pool.query('CREATE TABLE IF NOT EXISTS message_history (id SERIAL PRIMARY KEY, sender_id INT REFERENCES users(id), receiver_id INT REFERENCES users(id), content TEXT NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
      expect(result).toBeDefined();
    } catch (error) {
      fail(error);
    }
  });
});

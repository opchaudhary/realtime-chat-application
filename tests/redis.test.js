const { createClient } = require('redis');
const redisClient = require('./../src/config/redis');

describe('Redis Configuration', () => {
  // Unit Test: Check if the Redis configuration is defined
  it('should be defined', () => {
    expect(redisClient).toBeDefined();
  });

  // Integration Test: Test Redis client creation
  it('should create a Redis client', () => {
    expect(redisClient).toBeInstanceOf(createClient);
  });

  // Integration Test: Test Redis client properties
  it('should have correct client properties', () => {
    expect(redisClient.options.host).toBe('localhost');
    expect(redisClient.options.port).toBe(6379);
  });

  // Integration Test: Test Redis event listeners
  it('should have event listeners for connection and error', () => {
    expect(redisClient.listenerCount('connect')).toBe(1);
    expect(redisClient.listenerCount('error')).toBe(1);
  });
});

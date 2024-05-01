const runConsumer = require('../kafkaConsumer');
const WebSocket = require('ws');
const { Pool } = require('pg');
const { Kafka, CompressionTypes, logLevel } = require('kafkajs');

describe('Kafka Consumer and WebSocket Server', () => {
  let kafka;
  let pool;
  let server;

  beforeAll(async () => {
    // Initialize Kafka instance
    kafka = new Kafka({
      clientId: 'my-app',
      brokers: ['localhost:9092']
    });

    // Initialize PostgreSQL connection pool
    pool = new Pool({
      user: 'omprakash',
      host: 'localhost',
      database: 'testdb',
      password: 'omprakash',
      port: 5432,
    });

    // Initialize WebSocket server
    server = new WebSocket.Server({ noServer: true });

    // Run Kafka consumer
    await runConsumer(kafka, pool, server);
  });

  afterAll(async () => {
    // Close Kafka consumer
    await consumer.disconnect();

    // Close PostgreSQL connection pool
    await pool.end();
  });

  it('should store message in PostgreSQL and broadcast to WebSocket clients', async () => {
    // Mock Kafka message
    const mockMessage = {
      topic: 'chat-messages',
      partition: 0,
      message: {
        key: 'sender-id',
        value: 'Hello, World!'
      }
    };

    // Mock PostgreSQL query
    pool.query = jest.fn().mockResolvedValueOnce({ rows: [] });

    // Mock WebSocket clients
    const mockClient = {
      readyState: WebSocket.OPEN,
      send: jest.fn(),
    };
    server.clients = new Set([mockClient]);

    // Run Kafka consumer callback
    await runConsumer(mockMessage);

    // Check if message is stored in PostgreSQL
    expect(pool.query).toHaveBeenCalledWith('INSERT INTO message_history (sender_id, receiver_id, content) VALUES ($1, $2, $3)', ['sender-id', null, 'Hello, World!']);

    // Check if message is broadcasted to WebSocket clients
    expect(mockClient.send).toHaveBeenCalledWith('Hello, World!');
  });
});

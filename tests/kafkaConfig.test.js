// Import the Kafka configuration module
const kafka = require('./../src/config/kafkaConfig');

describe('Kafka Configuration', () => {
  // Unit Test: Check if the Kafka configuration is defined
  it('should be defined', () => {
    expect(kafka).toBeDefined();
  });

  // Unit Test: Check if the Kafka client is defined
  it('should have a Kafka client', () => {
    expect(kafka.client).toBeDefined();
  });

  // Integration Test: Test Kafka client connection
  it('should connect to Kafka brokers', async () => {
    try {
      await kafka.client.connect();
      const isConnected = kafka.client.isConnected();
      expect(isConnected).toBeTruthy();
      await kafka.client.disconnect();
    } catch (error) {
      fail(error);
    }
  });
});

const { Sequelize } = require('sequelize');
const MessageHistory = require('./../src/models/MessageHistory');
const User = require('./../src/models/MessageHistory');

describe('MessageHistory Model', () => {
  // Create an in-memory database for testing
  const sequelize = new Sequelize('sqlite::memory:', { logging: false });

  // Define the models and associations
  beforeAll(async () => {
    await sequelize.authenticate();
    await User.init({ sequelize });
    await MessageHistory.init({ sequelize });
    User.hasMany(MessageHistory, { foreignKey: 'sender_id' });
    User.hasMany(MessageHistory, { foreignKey: 'receiver_id' });
    await sequelize.sync({ force: true });
  });

  // Test cases for creating and retrieving message history
  describe('Create and Retrieve Message History', () => {
    it('should create a new message history entry', async () => {
      const sender = await User.create({ username: 'sender', password: 'password' });
      const receiver = await User.create({ username: 'receiver', password: 'password' });
      const message = await MessageHistory.create({
        sender_id: sender.id,
        receiver_id: receiver.id,
        content: 'Hello, world!'
      });
      expect(message.id).toBeDefined();
      expect(message.sender_id).toBe(sender.id);
      expect(message.receiver_id).toBe(receiver.id);
      expect(message.content).toBe('Hello, world!');
    });

    it('should retrieve message history for a given sender and receiver', async () => {
      const sender = await User.findOne({ where: { username: 'sender' } });
      const receiver = await User.findOne({ where: { username: 'receiver' } });
      const messages = await MessageHistory.findAll({
        where: {
          sender_id: sender.id,
          receiver_id: receiver.id
        }
      });
      expect(messages.length).toBe(1);
      expect(messages[0].sender_id).toBe(sender.id);
      expect(messages[0].receiver_id).toBe(receiver.id);
      expect(messages[0].content).toBe('Hello, world!');
    });
  });
});

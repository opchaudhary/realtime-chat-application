const { Sequelize } = require('sequelize');
const User = require('./../src/models/Users');

describe('User Model', () => {
  // Create an in-memory database for testing
  const sequelize = new Sequelize('sqlite::memory:', { logging: false });

  // Define the model
  beforeAll(async () => {
    await sequelize.authenticate();
    await User.init({ sequelize });
    await sequelize.sync({ force: true });
  });

  // Test cases for creating and retrieving users
  describe('Create and Retrieve Users', () => {
    it('should create a new user', async () => {
      const user = await User.create({ username: 'testuser', password: 'password' });
      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.password).toBe('password');
    });

    it('should retrieve an existing user by username', async () => {
      const user = await User.findOne({ where: { username: 'testuser' } });
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.password).toBe('password');
    });
  });
});

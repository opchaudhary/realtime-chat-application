const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('./../server'); // Update with the actual path to your app
const pool = require('../src/config/db');
const {
  registerUser,
  loginUser,
  verifyToken
} = require('../path/to/controller');

describe('User Authentication Controller', () => {
  let testUser;

  beforeAll(async () => {
    // Create a test user in the database
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const newUser = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', ['testuser', hashedPassword]);
    testUser = newUser.rows[0];
  });

  afterAll(async () => {
    // Delete the test user from the database after tests
    await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const newUser = {
        username: 'newuser',
        password: 'newpassword'
      };
      const res = await request(app)
        .post('/register')
        .send(newUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.username).toBe(newUser.username);
    });
  });

  describe('loginUser', () => {
    it('should log in an existing user', async () => {
      const credentials = {
        username: 'testuser',
        password: 'testpassword'
      };
      const res = await request(app)
        .post('/login')
        .send(credentials);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBeTruthy();
    });

    it('should return 404 if user does not exist', async () => {
      const credentials = {
        username: 'nonexistentuser',
        password: 'password'
      };
      const res = await request(app)
        .post('/login')
        .send(credentials);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 401 if password is incorrect', async () => {
      const credentials = {
        username: 'testuser',
        password: 'incorrectpassword'
      };
      const res = await request(app)
        .post('/login')
        .send(credentials);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const token = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
      const req = {
        headers: {
          authorization: token
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      verifyToken(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no token provided', async () => {
      const req = {
        headers: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      verifyToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      const req = {
        headers: {
          authorization: 'invalidtoken'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      verifyToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

const request = require('supertest');
const express = require('express');
const authRoutes = require('./../src/routes/authRoutes');

// Mock the authController methods
jest.mock('./../src/controllers/authController', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

describe('Auth Routes', () => {
  let app;

  // Set up a new express app before each test
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  // Test case for registering a new user
  it('POST /auth/register should create a new user', async () => {
    // Mock the registerUser method to return a successful response
    const mockUserData = { username: 'omprakashTest', password: 'testing123' };
    authController.registerUser.mockResolvedValue({ id: 1, ...mockUserData });

    // Make a request to register a new user
    const res = await request(app)
      .post('/auth/register')
      .send(mockUserData);

    // Assertions
    expect(res.statusCode).toBe(201);
    expect(authController.registerUser).toHaveBeenCalledWith(expect.objectContaining(mockUserData));
    expect(res.body).toEqual(expect.objectContaining({ id: 1, ...mockUserData }));
  });

  // Test case for logging in
  it('POST /auth/login should log in a user', async () => {
    // Mock the loginUser method to return a successful response
    const mockUserData = { username: 'testuser', password: 'password' };
    const mockToken = 'mockToken';
    authController.loginUser.mockResolvedValue({ message: 'Login successful', token: mockToken });

    // Make a request to log in
    const res = await request(app)
      .post('/auth/login')
      .send(mockUserData);

    // Assertions
    expect(res.statusCode).toBe(200);
    expect(authController.loginUser).toHaveBeenCalledWith(expect.objectContaining(mockUserData));
    expect(res.body).toEqual({ message: 'Login successful', token: mockToken });
  });
});

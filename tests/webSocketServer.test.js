const WebSocket = require('ws');
const startWebSocketServer = require('../startWebSocketServer');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const kafka = require('../config/kafkaConfig');

jest.mock('../config/redis');
jest.mock('../config/kafkaConfig');

describe('WebSocket Server', () => {
  let expressServer;
  let wss;
  let mockWebSocket;

  beforeAll(() => {

    kafka.producer.mockReturnValue({
      connect: jest.fn().mockResolvedValueOnce()
    });

    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      on: jest.fn()
    };
    wss = {
      on: jest.fn((event, cb) => {
        if (event === 'connection') {
          cb(mockWebSocket);
        }
      }),
      send: jest.fn()
    };
    WebSocket.Server.mockReturnValue(wss);

    expressServer = {}; 
    startWebSocketServer(expressServer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle incoming messages', () => {
    const message = JSON.stringify({ userId: 123, content: 'Hello, world!' });
    mockWebSocket.on.mock.calls[0][1](message);
    expect(kafka.producer().send).toHaveBeenCalledWith({
      topic: 'chat-messages',
      messages: [{ value: message }],
    });
  });

  it('should handle invalid JWT tokens', () => {
    const invalidToken = 'invalid.token';
    mockWebSocket.on.mock.calls[1][1](invalidToken);
    expect(jwt.verify).toHaveBeenCalledWith(invalidToken, process.env.JWT_SECRET_KEY, expect.any(Function));
    expect(mockWebSocket.send).toHaveBeenCalledWith('Invalid token');
    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('should handle Redis errors', () => {
    const validToken = 'valid.token';
    jwt.verify.mockImplementationOnce(() => ({ userId: 123 }));
    redisClient.get.mockImplementationOnce((token, callback) => {
      callback(new Error('Redis error'));
    });
    mockWebSocket.on.mock.calls[1][1](validToken);
    expect(redisClient.get).toHaveBeenCalledWith(validToken, expect.any(Function));
    expect(mockWebSocket.send).toHaveBeenCalledWith('Internal server error');
    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('should handle missing or expired tokens', () => {
    const expiredToken = 'expired.token';
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Token expired');
    });
    mockWebSocket.on.mock.calls[1][1](expiredToken);
    expect(mockWebSocket.send).toHaveBeenCalledWith('Unauthorized');
    expect(mockWebSocket.close).toHaveBeenCalled();
  });
});

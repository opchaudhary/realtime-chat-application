const WebSocket = require('ws');
const http = require('http');
const { setupWebSocketRoutes } = require('./../src/routes/websocketRoutes');
const { handleMessage } = require('./../src/websocketServer');

describe('WebSocket Routes', () => {
  let server;
  let wsClient;

  beforeAll((done) => {
    // Create a new HTTP server
    server = http.createServer();

    // Set up WebSocket routes on the server
    setupWebSocketRoutes(server);

    // Start the server listening on a random port
    server.listen(() => {
      // Connect WebSocket client to the server
      wsClient = new WebSocket(`ws://localhost:${server.address().port}`);
      wsClient.on('open', done);
    });
  });

  afterAll((done) => {
    // Close WebSocket connection and server after all tests
    wsClient.close();
    server.close(done);
  });

  it('should send a welcome message on connection', (done) => {
    wsClient.on('message', (message) => {
      expect(message).toBe('Welcome to the chat room!');
      done();
    });
  });

  it('should handle incoming messages', (done) => {
    const mockMessage = 'Hello, World!';

    // Mock handleMessage function
    const mockHandleMessage = jest.spyOn(global, 'handleMessage');
    mockHandleMessage.mockImplementation((ws, message) => {
      expect(message).toBe(mockMessage);
      done();
    });

    // Send a message from client
    wsClient.send(mockMessage);
  });
});

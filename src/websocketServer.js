const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const redisClient = require('./config/redis');
const kafka = require('./config/kafkaConfig');

// Kafka producer instance
const producer = kafka.producer();

// Function to start the WebSocket server
module.exports = function startWebSocketServer(expressServer) {
    // Create a WebSocket server
    const wss = new WebSocket.Server({ server: expressServer });

    // Connect the Kafka producer
    producer.connect().then(() => {
        console.log('Connected to Kafka');
    }).catch((error) => {
        console.error('Error connecting to Kafka:', error);
    });

    // WebSocket connection handler
    wss.on('connection', (ws) => {
        // On connection, send a welcome message
        ws.send('Welcome to the chat room!');

        // WebSocket message handler
        ws.on('message', async (message) => {
            // Assume message format is JSON with user ID and message content
            try {
                const { userId, content } = JSON.parse(message);
                console.log(`Received message from user ${userId}: ${content}`);
                // Produce message to Kafka
                producer.send({
                    topic: 'chat-messages',
                    messages: [{ value: message}],
                });
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
    
        // WebSocket message handler
        ws.on('message', async (message) => {
            // Verify JWT token from message
            const token = message;
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const userId = decoded.userId;

                // Check if the token exists in Redis
                redisClient.get(token, (err, reply) => {
                    if (err) {
                        console.error('Error retrieving token from Redis:', err);
                        ws.send('Internal server error');
                        ws.close();
                    } else if (!reply) {
                        console.log('Token not found in Redis');
                        // If token is not found or expired, close the WebSocket connection
                        ws.send('Unauthorized');
                        ws.close();
                    } else {
                        console.log('Token found in Redis');
                        // If token is valid, handle the message
                        handleMessage(message, userId);
                    }
                });
            } catch (error) {
                console.error('Error verifying JWT token:', error);
                ws.send('Invalid token');
                ws.close();
            }
        });
    });

    // Function to handle incoming messages
    function handleMessage(message, userId) {
        console.log(`Received message from user ${userId}: ${message}`);
        // Produce message to Kafka
        producer.send({
            topic: 'chat-messages',
            messages: [{ value: message.message }],
        });
    }
};


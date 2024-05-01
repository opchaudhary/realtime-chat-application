// server.js

require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/authRoutes');
const app = express();
const redisClient = require('./src/config/redis'); 
const webSocketServer = require('./src/websocketServer');
const runConsumer = require('./src/kafkaConsumer');
const path = require("path");
app.use(bodyParser.json());

app.use(express.static(path.resolve("./public")));
// Mount auth routes
app.use('/auth', authRoutes);

app.get("/",(req, res) => {
    return(res.sendFile("./public/index.html"))
})
// Check Redis connection status
redisClient.on('connect', () => {
    console.log('Connected to Redis server');
});
redisClient.connect();
redisClient.set("A","B");
redisClient.quit();

redisClient.on('error', (error) => {
    console.error('Error connecting to Redis:', error);
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Start the WebSocket server alongside the Express server
webSocketServer(server);

// Start Kafka consumer
runConsumer().then(() => {
    console.log('Kafka consumer is running');
}).catch((error) => {
    console.error('Error starting Kafka consumer:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server has been gracefully terminated');
        process.exit(0);
    });
});

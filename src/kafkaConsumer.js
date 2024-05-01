const kafka = require('./config/kafkaConfig');
const pool = require('./config/db');
const WebSocket = require('ws');

const consumer = kafka.consumer({ groupId: 'my-group' });
const wss = new WebSocket.Server({ noServer: true });

const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'chat-messages', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value.toString(),
            });

            // Parse and process message data
            const messageText = message.value.toString(); // Assuming the message is plain text
            const senderId = message.key; // Assuming a static sender ID for now
            const receiverId = null; // Assuming there's no receiver ID for now

            // Store message in PostgreSQL
            try {
                await pool.query('INSERT INTO message_history (sender_id, receiver_id, content) VALUES ($1, $2, $3)', [senderId, receiverId, messageText]);
                console.log('Message stored in PostgreSQL');
            } catch (error) {
                console.error('Error storing message in PostgreSQL:', error);
            }

            // Broadcast message to WebSocket clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(messageText);
                }
            });
        },
    });
};

module.exports = runConsumer, wss ;

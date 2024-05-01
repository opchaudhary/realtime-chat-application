const WebSocket = require('ws');
const { handleMessage } = require('./websocketService');

module.exports = function setupWebSocketRoutes(expressServer) {
    const wss = new WebSocket.Server({ server: expressServer });

    wss.on('connection', (ws) => {
        ws.send('Welcome to the chat room!');

        ws.on('message', async (message) => {
            handleMessage(ws, message);
        });
    });
};

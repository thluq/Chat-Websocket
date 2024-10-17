const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = {};

wss.on('connection', (ws) => {
    ws.on('error', console.error);

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'join':
                if (!rooms[data.room]) {
                    rooms[data.room] = [];
                }
                if (rooms[data.room].length < 2) {
                    rooms[data.room].push(ws);
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Sala cheia' }));
                }
                break;
            case 'message':
                if (rooms[data.room]) {
                    rooms[data.room].forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'message', text: data.text, username: data.username }));
                        }
                    });
                }
                break;
        }
    });

    ws.on('close', () => {
        for (const room in rooms) {
            rooms[room] = rooms[room].filter(client => client !== ws);
        }
    });
});

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

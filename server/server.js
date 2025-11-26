// Importing node modules
const http = require('http');
const { WebSocketServer } = require('ws');
const express = require('express');
const path = require('path');

// Creating an Express app to serve static files
const app = express();

// Serve static files from the 'assets' folder (including audio)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Creating an HTTP Server
const server = http.createServer(app);

// Creating a WebSocket Server to allow "persistent connection"
const wss = new WebSocketServer({ server });

// Tracking connected players and their roles
let players = [];

wss.on('connection', (socket) => {
    console.log('Client connected');

    // Assign roles to the first two players
    let playerRole;
    if (players.length === 0) {
        playerRole = 'dj'; // First player gets DJ role
    } else if (players.length === 1) {
        playerRole = 'vj'; // Second player gets VJ role
    } else {
        playerRole = null; // No more players can join
    }

    // Send role assignment to the client
    socket.send(JSON.stringify({ type: 'assign', role: playerRole }));

    // Add the player to the list
    players.push(socket);

    // Telling the server what to do when it receives a new message on that connection
    socket.on('message', (data) => {
       // console.log('Received: ', data.toString());

        // Go through all of the clients
        wss.clients.forEach((client) => {
            if (client !== socket && client.readyState === client.OPEN) {
                // Send each client the message it just received
                client.send(data.toString());
            }
        });
    });

    // Tell the server what we want it to do when the clients close the connection
    socket.on('close', () => {
        console.log('Client Disconnect');
        // Remove the player from the list
        players = players.filter(client => client !== socket);
    });
});

// Telling the server to listen on a specific port
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Worker } = require('worker_threads');

// Create an express app and set up HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store active clients with their full names
const clients = {};

// Handle new socket connection
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Default user name is their socket id, but we will allow the user to set it
  clients[socket.id] = { name: `User${socket.id}`, socket };

  // Send a message to the client asking them to set their name
  socket.emit('ask name');

  // Create a new worker thread to handle this socket connection
  const worker = new Worker('./socketWorker.js', {
    workerData: { socketId: socket.id }
  });

  // Send the worker a reference to the socket
  worker.on('message', (message) => {
    // Broadcast the message received from the worker to all clients
    io.emit('chat message', message);
  });

  worker.on('error', (err) => {
    console.error('Error in worker thread:', err);
  });

  worker.on('exit', (code) => {
    if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
  });

  // Listen for messages from client
  socket.on('set name', (name) => {
    clients[socket.id].name = name; // Update user's name
  });

  socket.on('chat message', (msg) => {
    worker.postMessage({ type: 'message', msg, userName: clients[socket.id].name });
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    worker.postMessage({ type: 'disconnect' });
    delete clients[socket.id]; // Remove client from list
    console.log('User disconnected');
  });
});

// Start server on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

const { parentPort, workerData } = require('worker_threads');

// Worker data contains the socket ID (not the actual socket object)
const { socketId } = workerData;

// Function to handle message from main thread
parentPort.on('message', (message) => {
  if (message.type === 'message') {
    // Handle chat message
    console.log(`Message from ${message.userName}: ${message.msg}`);
    parentPort.postMessage({ userName: message.userName, msg: message.msg }); // Send back to main thread
  } else if (message.type === 'disconnect') {
    // Handle disconnection
    console.log(`User ${socketId} disconnected`);
  }
});

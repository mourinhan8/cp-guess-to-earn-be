const { Server } = require('socket.io');
const authSocket = require("../middleware/authSocket");

let io;

const initSocket = (server, handler) => {
  io = new Server(server, {
    path: "/queue/socket.io",
    cors: {
      origin: '*',
    },
  });
  io.use(authSocket);

  io.on('connection', (socket) => {
    console.log('a user connected');
    const socketId = socket.id;
    io.to(`${socketId}`).emit('userConnected', { message: 'connected' });
    onlineUsers.set(socket.authData.verifiedAddress, socketId);
    handler(socket, io);
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};

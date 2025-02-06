const jwt = require('jsonwebtoken');
const authSocket = async (socket, next) => {
  // Get token from header
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const { userId } = decoded;
    if (!userId) {
      throw next(new Error('Token is not valid'));
    }
    socket.authData = decoded;
    next();
  } catch (err) {
    console.log(err.message);
    return next(err);
  }
};

module.exports = authSocket;

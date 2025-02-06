const User = require('../models/userModel');
const GuessHistory = require('../models/guessHistoryModel');
const { ONE_SECOND } = require('../utils/constants');
const guessQueue = require('../queue/guess/guess.queue');

const socketHandler = (socket, io) => {
  socket.on('guess', async ({ guess, priceAtGuess }) => {
    const { userId } = socket.authData;
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Account has not been created');
      }
      const guessHistory = new GuessHistory({
        guessBy: user._id,
        guess,
        priceAtGuess
      });
      const newGuessHistory = await guessHistory.save();
      const { _id: guessId, guessBy } = newGuessHistory;
      await guessQueue.add({ guessId, userId: guessBy, priceAtGuess, guess, socketId: socket.id }, {
        delay: 5 * ONE_SECOND,
        removeOnComplete: true,
        attempts: 3,
      });
      socket.emit("guessSuccess", { message: "OK", data: newGuessHistory.toJSON() });
    } catch (error) {
      console.log(error);
      socket.emit("guessError", { message: "NOK", error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
};


module.exports = {
  socketHandler
};

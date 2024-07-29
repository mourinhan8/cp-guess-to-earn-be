const User = require('../models/userModel');
const GuessHistory = require('../models/guessHistoryModel');
const {
  SCORE_FOR_1_MIN,
  SCORE_FOR_1_DAY,
  ONE_DAY,
  ONE_MINUTE
} = require('../utils/constants');
const guessQueue = require('../queue/guess/guess.queue');

const socketHandler = (socket, io) => {
  socket.on('guess', async ({ type, priceAtGuess }) => {
    const { verifiedAddress } = socket.authData;
    try {
      const user = await User.findOne({ walletAddress: verifiedAddress });
      if (!user) {
        throw new Error('Account has not been created');
      }
      const guessHistory = new GuessHistory({
        guessBy: user._id,
        type,
        prizeScore: type === 'min' ? SCORE_FOR_1_MIN : SCORE_FOR_1_DAY,
        priceAtGuess
      });
      const newGuessHistory = await guessHistory.save();
      const { _id: guessId, guessBy: userId } = newGuessHistory;
      await guessQueue.add({ guessId, userId, priceAtGuess, type, socketId: socket.id }, {
        delay: type === 'min' ? ONE_MINUTE : ONE_DAY,
        // delay: 2000,
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

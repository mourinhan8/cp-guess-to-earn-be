const GuessHistory = require('../../models/guessHistoryModel');
const User = require('../../models/userModel');
const { getCPPrice } = require('../../utils/useApi');
const mongoose = require('mongoose');
const { SCORE_FOR_1_MIN, SCORE_FOR_1_DAY } = require('../../utils/constants');
const { getIO } = require('../../socket/io');
const guessProcess = async (data) => {
  try {
    const { guessId, userId, priceAtGuess, type, socketId } = data;
    const io = getIO();
    const socket = io.sockets.sockets.get(socketId);
    const currentPrice = await getCPPrice();
    if (currentPrice <= priceAtGuess) {
      await GuessHistory.findOneAndUpdate(
        { _id: guessId },
        {
          $set: {
            resultPrice: currentPrice,
            guessResult: 'lose',
          }
        }
      );
      if (socket) {
        socket.emit('guessResult', {
          message: "You have guessed incorrectly",
          result: "lose"
        });
      }
    } else {
      console.log('win');
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        await Promise.all([
          GuessHistory.findOneAndUpdate(
            { _id: guessId },
            {
              $set: {
                claimed: true,
                resultPrice: currentPrice,
                guessResult: 'win',
              }
            },
            { session, new: true },
          ),
          User.findOneAndUpdate(
            { _id: userId },
            { $inc: { score: type === 'min' ? SCORE_FOR_1_MIN : SCORE_FOR_1_DAY } },
            { session, new: true },
          )
        ]);
        if (socket) {
          socket.emit('guessResult', {
            message: "You have guessed correctly",
            result: "won"
          });
        }
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession()
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = guessProcess;

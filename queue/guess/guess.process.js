const GuessHistory = require('../../models/guessHistoryModel');
const User = require('../../models/userModel');
const { getCPPrice } = require('../../utils/useApi');
const mongoose = require('mongoose');
const { SCORE_FOR_1_MIN, SCORE_FOR_1_DAY, SCORE_FOR_DRAW_MIN } = require('../../utils/constants');
const { getIO } = require('../../socket/io');
const guessProcess = async (data) => {
  try {
    const { guessId, userId, priceAtGuess, type, socketId } = data;
    const io = getIO();
    const socket = io.sockets.sockets.get(socketId);
    const currentPrice = await getCPPrice();
    console.log('current price', currentPrice);
    console.log('price at guess', priceAtGuess);
    if (currentPrice < priceAtGuess) {
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
          result: "lose",
        });
      }
    } else {
      let session = null;
      let updatedGuess, updatedUser;
      try {
        session = await mongoose.startSession();
        session.startTransaction();
        if (currentPrice > priceAtGuess) {
          console.log('win');
          [updatedGuess, updatedUser] = await Promise.all([
            GuessHistory.findOneAndUpdate(
              { _id: guessId },
              {
                $set: {
                  claimed: true,
                  resultPrice: currentPrice,
                  guessResult: 'win',
                }
              },
              { session, new: true }
            ),
            User.findOneAndUpdate(
              { _id: userId },
              { $inc: { score: type === 'min' ? SCORE_FOR_1_MIN : SCORE_FOR_1_DAY } },
              { session, new: true }
            )
          ]);
          if (!updatedGuess || !updatedUser) {
            throw new Error('Failed to update guess or user');
          }
          if (socket) {
            socket.emit('guessResult', {
              message: "You have guess correctly. Receive 10 scores",
              result: "won",
              userScore: updatedUser.score
            });
          }
        } else {
          console.log('draw');
          [updatedGuess, updatedUser] = await Promise.all([
            GuessHistory.findOneAndUpdate(
              { _id: guessId },
              {
                $set: {
                  claimed: true,
                  resultPrice: currentPrice,
                  guessResult: 'draw',
                }
              },
              { session, new: true }
            ),
            User.findOneAndUpdate(
              { _id: userId },
              { $inc: { score: SCORE_FOR_DRAW_MIN } },
              { session, new: true }
            )
          ]);
          if (!updatedGuess || !updatedUser) {
            throw new Error('Failed to update guess or user');
          }
          if (socket) {
            socket.emit('guessResult', {
              message: "Price remains the same, You have 1 score",
              result: "draw",
              userScore: updatedUser.score
            });
          }
        }
        await session.commitTransaction();
      } catch (error) {
        console.error('Transaction failed:', error);
        if (session) {
          try {
            await session.abortTransaction();
          } catch (abortError) {
            console.error('Error aborting transaction:', abortError);
          }
        }
      } finally {
        if (session) {
          try {
            await session.endSession();
          } catch (endSessionError) {
            console.error('Error ending session:', endSessionError);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = guessProcess;

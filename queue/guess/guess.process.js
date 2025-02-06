const GuessHistory = require('../../models/guessHistoryModel');
const User = require('../../models/userModel');
const { getBitcoinPrice } = require('../../utils/useApi');
const mongoose = require('mongoose');
const { SCORE_FOR_A_WIN } = require('../../utils/constants');
const { getIO } = require('../../socket/io');
const guessProcess = async (data) => {
  try {
    const { guessId, userId, priceAtGuess, guess, socketId } = data;
    const io = getIO();
    const socket = io.sockets.sockets.get(socketId);
    const currentPrice = await getBitcoinPrice();
    console.log('prediction', guess);
    console.log('current price', currentPrice);
    console.log('price at guess', priceAtGuess);
    if (guess === 'up' && currentPrice > priceAtGuess || guess === 'down' && currentPrice < priceAtGuess) {
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
                  priceAtEnd: currentPrice,
                  guessResult: 'win',
                }
              },
              { session, new: true }
            ),
            User.findOneAndUpdate(
              { _id: userId },
              { $inc: { score: SCORE_FOR_A_WIN } },
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
    } else {
      console.log('lose');
      await GuessHistory.findOneAndUpdate(
        { _id: guessId },
        {
          $set: {
            priceAtEnd: currentPrice,
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
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = guessProcess;

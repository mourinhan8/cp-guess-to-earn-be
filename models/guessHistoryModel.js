const mongoose = require('mongoose');

const guessHistorySchema = new mongoose.Schema({
  guessBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  guess: {
    type: String,
    enum: ['up', 'down'],
    require: true
  },
  priceAtGuess: {
    type: Number,
    require: true
  },
  priceAtEnd: {
    type: Number,
  },
  guessResult: {
    type: String,
    enum: ['win', 'lose']
  },
}, {
  timestamps: true,
  collection: 'GuessHistory'
});

guessHistorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

guessHistorySchema.set('toJSON', {
  virtuals: true,
});

const GuessHistory = mongoose.model('GuessHistory', guessHistorySchema);

module.exports = GuessHistory;

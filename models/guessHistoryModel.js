const mongoose = require('mongoose');

const guessHistorySchema = new mongoose.Schema({
  guessBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  type: {
    type: String,
    enum: ['min', 'day'],
    require: true
  },
  prizeScore: {
    type: Number,
    require: true
  },
  priceAtGuess: {
    type: Number,
    require: true
  },
  claimed: {
    type: Boolean,
    default: false
  },
  resultPrice: {
    type: Number,
  },
  guessResult: {
    type: String,
    enum: ['win', 'lose', 'draw']
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

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    require: true
  },
  avatar: {
    type: String
  },
  username: {
    type: String,
    unique: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  walletAddress: {
    type: String,
    unique: true,
  },
  score: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
  collection: 'User'
});

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

userSchema.set('toJSON', {
  virtuals: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;

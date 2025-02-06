const express = require('express');
const User = require('../models/userModel');
const GuessHistory = require('../models/guessHistoryModel');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { page, limit } = req.query;
  const { verifiedAddress } = req.authData;
  try {
    const user = await User.findOne({ walletAddress: verifiedAddress });
    if (!user) {
      throw new Error('Account has not been created');
    }
    let pageSize = 10;
    let currentPage = 1;
    if (limit) {
      pageSize = +limit;
    }
    if (Number(limit) > 20) {
      pageSize = 20;
    }
    if (page) {
      currentPage = +page;
    }

    const skip = (currentPage - 1) * pageSize;

    const QueryGuessHistory = GuessHistory.find({ guessBy: user._id })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .exec();
    const [guessHistory, total] = await Promise.all([QueryGuessHistory, GuessHistory.countDocuments({ guessBy: user._id })]);
    return res.json({
      message: "OK",
      data: guessHistory,
      paging: {
        total,
        page: currentPage,
        limit: pageSize
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "NOK", error: error.message });
  }
});

module.exports = router;

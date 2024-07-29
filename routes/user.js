const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth")

const router = express.Router();

router.post('/create', auth, async (req, res) => {
  const { verifiedAddress } = req.authData;
  
  try {
    if (!verifiedAddress) {
      throw new Error('Invalid address');
    }
    let user = await User.findOne({ walletAddress: verifiedAddress });
    if (!user) {
      const newUser = new User({
        walletAddress: verifiedAddress
      });
      user = await newUser.save();
    }
    return res.json({ message: "OK", data: user.toJSON() });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "NOK", error: error.message });
  }
});

router.get('/list-users', async (req, res) => {
  try {
    const users = await User.find();
    return res.json({ message: "OK", data: users });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "NOK", error: error.message });
  }
});

module.exports = router;

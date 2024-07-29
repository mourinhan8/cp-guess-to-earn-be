const express = require('express');
const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");

const router = express.Router();

function getSignMessage(address, nonce) {
  return `Verification for address ${address}:\n\n${nonce}`;
}

router.get('/nonce', async (req, res) => {
  const nonce = new Date().getTime();
  const address = req.query.address;

  const tempToken = jwt.sign({ nonce, address }, process.env.PRIVATE_KEY, {
    expiresIn: "60s",
  });
  const message = getSignMessage(address, nonce);

  res.json({ tempToken, message });
});

router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const tempToken = authHeader && authHeader.split(" ")[1];

    if (tempToken === null) return res.sendStatus(403);

    const authData = await jwt.verify(tempToken, process.env.PRIVATE_KEY);
    const nonce = authData.nonce;
    const address = authData.address;
    const signature = req.query.signature;
    const message = getSignMessage(address, nonce);

    const verifiedAddress = ethers.verifyMessage(message, signature);

    if (verifiedAddress.toLowerCase() === address.toLowerCase()) {
      const token = jwt.sign({ verifiedAddress: verifiedAddress.toLowerCase() }, process.env.PRIVATE_KEY, {
        expiresIn: "1d",
      });
      return res.json({ token });
    } else {
      throw new Error('Invalid address');
    }
  } catch (exception) {
    console.log(exception);
    return res.status(400).json({
      message: "NOK",
      error: exception.message,
    });
  }
});

router.get('/secret', (req, res) => {
  res.send(`Welcome address ${req.authData.verifiedAddress}`);
})

module.exports = router;

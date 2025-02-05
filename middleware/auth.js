const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  const authHeader = req.header('authorization');

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "NOK", error: 'No token provided' });
  }

  try {
    const decoded = await jwt.verify(token, process.env.PRIVATE_KEY);
    const { userId } = decoded;
    if (!userId) {
      throw new Error('Token is not valid');
    }
    req.authData = decoded;
    next();
  } catch (err) {
    console.log(err);
    if (err?.name === "TokenExpiredError") {
      return res.status(400).json({ message: "NOK", error: "Token is expired" });
    }
    return res.status(401).json({ message: "NOK", error: 'Token is not valid' });
  }
};

module.exports = auth;

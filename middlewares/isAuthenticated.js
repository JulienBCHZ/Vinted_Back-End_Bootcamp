const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = req.headers.authorization.replace("Bearer ", "");

    const getUserToken = await User.findOne({ token: token }).select(
      "-salt -hash"
    );

    if (!getUserToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = getUserToken;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = isAuthenticated;

const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // slicer pour avoir une string avec uniquement le token
    const token = req.headers.authorization.replace("Bearer ", "");

    // check s'il y a un user associé à ce token (cad ce token existe dans la collection User de la BDD)
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

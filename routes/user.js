const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");

// 🛑🛑 CRUD USER 🛑🛑

// CREATE user acount
router.post("/user/signup", async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(403).json({ message: "Email needed" });
    } else if (!req.body.username) {
      return res.status(403).json({ message: "Username needed" });
    } else if (!req.body.password) {
      return res.status(403).json({ message: "Choose a password" });
    }

    const userToCheck = await User.findOne({ email: req.body.email });
    if (userToCheck) {
      return res.json({
        message: "Unauthorized",
      });
    }
    const usernameToCheck = await User.findOne({
      account: { username: req.body.username },
    });
    if (usernameToCheck) {
      return res.json({ message: "Username unavailable" });
    }

    // Password encryption
    const salt = uid2(16);

    const passwordSalt = req.body.password + salt;

    const hash = SHA256(passwordSalt).toString(encBase64);

    const token = uid2(64);

    // créa User
    const newUser = new User({
      email: req.body.email,
      account: { username: req.body.username },
      newsletter: req.body.newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });

    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: { username: newUser.account.username },
    });
  } catch (error) {
    console.log(error), res.status(500).json({ message: error.message });
  }
});

// LOGIN user acount
router.post("/user/login", async (req, res) => {
  try {
    const userLogin = await User.findOne({ email: req.body.email });
    if (!userLogin) {
      return res.json({ message: "Unauthorized" });
    }

    const passwordSaltLogin = req.body.password + userLogin.salt;
    const hashLogin = SHA256(passwordSaltLogin).toString(encBase64);

    if (hashLogin === userLogin.hash) {
      res.json({
        _id: userLogin._id,
        token: userLogin.token,
        account: { username: userLogin.account.username },
      });
    } else {
      return res.json({ message: "Unauthorized" });
    }

    // res.json({ message: "Please wait..." });
  } catch (error) {
    console.log(error), res.status(500).json({ message: error.message });
  }
});

module.exports = router;

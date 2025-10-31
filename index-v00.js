const express = require("express");
const mongoose = require("mongoose");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/vinted");

// MODEL USER
const User = mongoose.model("User", {
  email: String,
  account: {
    username: String,
    avatar: Object, // nous verrons plus tard comment uploader une image
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});

// 🛑🛑 CRUD USER 🛑🛑

// CREATE user
app.post("/user/signup", async (req, res) => {
  try {
  } catch (error) {
    console.log(error), res.status(500).json({ message: "Error server" });
  }
});
// READ all users
app.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find();
  } catch (error) {
    console.log(error), res.status(500).json({ message: "Error server" });
  }
});

// SERVER
app.all(/.*/, (req, res) => {
  res.json({ message: "Route does not exist" });
});

app.listen(3000, () => {
  console.log("Server started 🚀");
});

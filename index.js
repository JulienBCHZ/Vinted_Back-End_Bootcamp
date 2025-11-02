require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const app = express();

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/vinted");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/", (req, res) => {
  res.json({ message: "We are in !" });
});

app.use(userRoutes);

app.use(offerRoutes);

// SERVER
app.all(/.*/, (req, res) => {
  res.json({ message: "Route does not exist" });
});

app.listen(3000, () => {
  console.log("Server started 🚀");
});

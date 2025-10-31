const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

// 🛑🛑 CRUD OFFER 🛑🛑

// READ
router.get("/offers", isAuthenticated, async (req, res) => {
  try {
    // console.log("QUERIES :", req.query);
    const { title, priceMin, priceMax, sort, page } = req.query;
    console.log("PRICEMIN :", priceMin);
    console.log("TITLE :", title);
    console.log("PRICEMAX :", priceMax);

    if (priceMin && !priceMax) {
      const offers = await Offer.find({
        product_name: new RegExp(title, "i"),
        product_price: { $gte: priceMin },
      })
        .select("product_name product_price")
        .populate("owner", "account");

      return res.json({ message: "All offers :", data: offers });
    } else if (priceMax && !priceMin) {
      const offers = await Offer.find({
        product_name: new RegExp(title, "i"),
        product_price: { $lte: priceMax },
      })
        .select("product_name product_price")
        .populate("owner", "account");

      return res.json({ message: "All offers :", data: offers });
    } else if (priceMin && priceMax) {
      const offers = await Offer.find({
        product_name: new RegExp(title, "i"),
        product_price: { $gte: priceMin, $lte: priceMax },
      })
        .select("product_name product_price")
        .populate("owner", "account");

      return res.json({ message: "All offers :", data: offers });
    }

    const offers = await Offer.find({
      product_name: new RegExp(title, "i"),
    })
      .select("product_name product_price")
      .populate("owner", "account");

    // res.json({ message: "Wait..." });
    res.json({ message: "All offers :", data: offers });
  } catch (error) {
    console.log(error), res.status(500).json({ message: error.message });
  }
});

module.exports = router;

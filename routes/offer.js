const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

// 🛑🛑 CRUD OFFER 🛑🛑

// CREATE
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      //   const date = new Date();

      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      if (title.length > 50 || description.length > 500 || price > 100000) {
        return res.status(406).json({ message: "Not acceptable" });
      }

      // UPLOAD des images
      let allCloudinaryResponses = [];
      for (i = 0; i < req.files.image.length; i++) {
        const fileToString = convertToBase64(req.files.image[i]);
        const cloudinaryResponse = await cloudinary.uploader.upload(
          fileToString,
          { asset_folder: `/${req.user.account.username}/${title}` }
        );
        allCloudinaryResponses.push(cloudinaryResponse);
      }
      // const fileToString = convertToBase64(req.files.image);
      // const cloudinaryResponse = await cloudinary.uploader.upload(
      //   fileToString
      // );

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { BRAND: brand },
          { SIZE: size },
          { CONDITION: condition },
          { COLOR: color },
          { CITY: city },
        ],
        product_image: allCloudinaryResponses,
        owner: req.user._id,
      });

      await newOffer.save();
      const newOfferSave = await newOffer.populate("owner", "account");

      res.json({ message: "Offer created", data: newOfferSave });
      // res.json({ message: "Wait..." });
    } catch (error) {
      console.log(error), res.status(500).json({ message: error.message });
    }
  }
);

// READ
router.get("/offers", isAuthenticated, async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;

    let skipValue = 0;
    let limitValue = 5;

    if (!page) {
      skipValue = 0;
      limitValue = 5;
    }
    if (page) {
      skipValue = limitValue * page - 5;
    }

    const regExp = new RegExp(title, "i");
    const priceMinFilter = { $gte: priceMin };
    const priceMaxFilter = { $lte: priceMax };
    const priceFilter = { $gte: priceMin, $lte: priceMax };

    const filters = {};

    if (title) {
      filters.product_name = regExp;
    }
    if (priceMin) {
      filters.product_price = priceMinFilter;
    }
    if (priceMax) {
      filters.product_price = priceMaxFilter;
    }
    if (priceMin && priceMax) {
      filters.product_price = priceFilter;
    }

    const sortValue = {};

    if (sort === "price-desc") {
      sortValue.product_price = "desc";
    }
    if (sort === "price-asc") {
      sortValue.product_price = "asc";
    }

    const offers = await Offer.find(filters)
      .sort(sortValue)
      .skip(skipValue)
      .limit(limitValue)
      .populate("owner", "account");
    // .select("product_name product_price");

    const count = await Offer.countDocuments(filters);
    // res.json({ message: "Wait..." });
    res.json({ count: count, offers: offers });
  } catch (error) {
    console.log(error), res.status(500).json({ message: error.message });
  }
});

// READ by ID
router.get("/offers/:id", isAuthenticated, async (req, res) => {
  try {
    console.log("ID :", req.params);

    const id = req.params.id;

    const offer = await Offer.findById(id).populate("owner", "account");

    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

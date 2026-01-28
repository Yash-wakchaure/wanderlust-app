const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing}= require("../middlewear.js");
const listingController = require("../controllers/listings.js");

const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const { findById } = require("../models/review.js");
const upload = multer({ storage });

router.get("/category/:category", listingController.selectCategory);

// combining Index route and create  
router.route("/" )
      .get(wrapAsync(listingController.index))
      .post(isLoggedIn, upload.single("listing[image]"), wrapAsync( listingController.creatListing));
     
// New route for adding new listing 
router.get("/new", isLoggedIn, listingController.renderNewForm);


// show, update and delete  
router.route("/:id")
      .get(wrapAsync(listingController.showListing))
      .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing , wrapAsync(listingController.updateListing))
      .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)
);

// Index Route
// router.get("/",wrapAsync(listingController.index));

// show rout which shows the all details about the list
// router.get("/:id", wrapAsync(listingController.showListing));

// create  route 
// router.post("/", isLoggedIn, validateListing , wrapAsync( listingController.creatListing));

// update route
// router.put("/:id", isLoggedIn, isOwner, validateListing , wrapAsync(listingController.updateListing));

//edit rout 
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm)); 

// delete route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
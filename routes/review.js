const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middlewear.js");

const  reviewController = require("../controllers/reviews.js");

// Review
// Post review Rout
router.post("/", validateReview, isLoggedIn, wrapAsync(reviewController.createReview));

// delete review route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
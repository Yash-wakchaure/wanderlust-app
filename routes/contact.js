const express = require("express");
const router = express.Router({ mergeParams: true });
const contactController = require("../controllers/contact.js");
const { isLoggedIn } = require("../middlewear.js");
const wrapAsync = require("../utils/wrapAsync.js");

// Show contact form
router.get("/listings/:id/contact", isLoggedIn, wrapAsync(contactController.renderContactForm));
// Handle contact form submission
router.post("/listings/:id/contact", isLoggedIn, wrapAsync(contactController.sendContact));

module.exports = router;

const express = require("express");
const router = express.Router({ mergeParams: true });
const bookingController = require("../controllers/booking.js");
const { isLoggedIn } = require("../middlewear.js");
const wrapAsync = require("../utils/wrapAsync.js");

// Show booking form
router.get("/listings/:id/book", isLoggedIn, wrapAsync(bookingController.renderBookingForm));

// Create booking
router.post("/listings/:id/book", isLoggedIn, wrapAsync(bookingController.createBooking));

// Get bookings for a listing (owner view)
router.get("/listings/:id/bookings", isLoggedIn, wrapAsync(bookingController.ownerBookings));

// Get user's bookings
router.get("/my-bookings", isLoggedIn, wrapAsync(bookingController.userBookings));

// Cancel booking
router.delete("/listings/:id/bookings/:bookingId", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;

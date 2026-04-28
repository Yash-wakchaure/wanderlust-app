const Booking = require("../models/booking");
const Listing = require("../models/listing");

// Helper function to check if dates overlap
const hasOverlappingBooking = async (listingId, checkInDate, checkOutDate) => {
    const existingBooking = await Booking.findOne({
        listing: listingId,
        status: { $ne: "cancelled" },
        $or: [
            {
                checkInDate: { $lt: checkOutDate },
                checkOutDate: { $gt: checkInDate }
            }
        ]
    });
    return existingBooking;
};

// Get booking availability
module.exports.getAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const bookings = await Booking.find({
            listing: id,
            status: { $ne: "cancelled" }
        }).select("checkInDate checkOutDate");

        const bookedDates = [];
        bookings.forEach(booking => {
            let currentDate = new Date(booking.checkInDate);
            while (currentDate < booking.checkOutDate) {
                bookedDates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        res.json({ bookedDates });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
module.exports.renderBookingForm = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        res.render("listings/booking", { listing });
    } catch (err) {
        req.flash("error", "Error loading booking form");
        res.redirect(`/listings/${id}`);
    }
};

// Create booking
module.exports.createBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkInDate, checkOutDate, numberOfGuests } = req.body;

        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (checkIn >= checkOut) {
            req.flash("error", "Check-out date must be after check-in date");
            return res.redirect(`/listings/${id}/book`);
        }

        // Get listing
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        // Check for overlapping bookings
        const overlap = await hasOverlappingBooking(id, checkIn, checkOut);
        if (overlap) {
            req.flash("error", "These dates are already booked. Please select different dates.");
            return res.redirect(`/listings/${id}/book`);
        }

        // Calculate number of nights
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * listing.price;

        // Create booking
        const booking = new Booking({
            listing: id,
            guest: req.user._id,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests,
            totalPrice,
            status: "confirmed"
        });

        await booking.save();
        req.flash("success", `Booking confirmed! Total: ₹${totalPrice.toLocaleString("en-IN")}`);
        res.redirect(`/listings/${id}`);
    } catch (err) {
        req.flash("error", "Error creating booking");
        res.redirect(`/listings/${id}`);
    }
};

// Get bookings for a listing
module.exports.listingBookings = async (req, res) => {
    try {
        const { id } = req.params;
        const bookings = await Booking.find({
            listing: id,
            status: { $ne: "cancelled" }
        }).populate("guest", "username email");

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cancel booking
module.exports.cancelBooking = async (req, res) => {
    try {
        const { id, bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect(`/listings/${id}`);
        }

        // Check if user is owner or guest
        if (!booking.guest.equals(req.user._id) && !req.user.isAdmin) {
            req.flash("error", "Not authorized to cancel this booking");
            return res.redirect(`/listings/${id}`);
        }

        booking.status = "cancelled";
        await booking.save();

        req.flash("success", "Booking cancelled successfully");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        req.flash("error", "Error cancelling booking");
        res.redirect(`/listings/${id}`);
    }
};

// Get user's bookings
module.exports.userBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            guest: req.user._id,
            status: { $ne: "cancelled" }
        }).populate("listing", "title image price location").sort({ checkInDate: -1 });

        const validBookings = bookings.filter((booking) => booking.listing);

        res.render("users/my-bookings", { bookings: validBookings });
    } catch (err) {
        req.flash("error", "Error loading bookings");
        res.redirect("/listings");
    }
};

// Get owner's bookings for their listings
module.exports.ownerBookings = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing || !listing.owner.equals(req.user._id)) {
            req.flash("error", "Not authorized");
            return res.redirect("/listings");
        }

        const bookings = await Booking.find({
            listing: id,
            status: { $ne: "cancelled" }
        }).populate("guest", "username email").sort({ checkInDate: -1 });

        res.render("listings/bookings", { listing, bookings });
    } catch (err) {
        req.flash("error", "Error loading bookings");
        res.redirect("/listings");
    }
};

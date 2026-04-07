const Contact = require("../models/contact");
const Listing = require("../models/listing");
const User = require("../models/user");

module.exports.renderContactForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/contact", { listing });
};

module.exports.sendContact = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    const { name, email, message } = req.body;
    const contact = new Contact({
        name,
        email,
        message,
        listing: listing._id,
        owner: listing.owner._id,
        sender: req.user._id
    });
    await contact.save();
    req.flash("success", "Your message has been sent to the owner.");
    res.redirect(`/listings/${id}`);
};

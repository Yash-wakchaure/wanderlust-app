const Contact = require("../models/contact");
const Listing = require("../models/listing");
const User = require("../models/user");
const { sendOwnerContactEmail, sendOwnerReplyEmail } = require("../utils/mailer");

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

    let emailSent = false;

    try {
        emailSent = await sendOwnerContactEmail({
            ownerEmail: listing.owner.email,
            ownerUsername: listing.owner.username,
            senderName: name,
            senderEmail: email,
            message,
            listingTitle: listing.title,
            listingId: listing._id,
        });
    } catch (err) {
        console.log("Owner contact email failed:", err.message);
    }

    if (emailSent) {
        req.flash("success", "Your message has been saved and emailed to the owner.");
    } else {
        req.flash("success", "Your message has been saved in the owner's inbox.");
    }

    res.redirect(`/listings/${id}`);
};

module.exports.ownerInbox = async (req, res) => {
    const messages = await Contact.find({ owner: req.user._id })
        .populate("listing", "title")
        .populate("owner", "username email")
        .populate("sender", "username email")
        .sort({ createdAt: -1 });

    res.render("users/owner-inbox", { messages });
};

module.exports.renderReplyForm = async (req, res) => {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId)
        .populate("listing", "title")
        .populate("owner", "username email");

    if (!contact || !contact.owner || !contact.owner._id.equals(req.user._id)) {
        req.flash("error", "Message not found or access denied.");
        return res.redirect("/owner/messages");
    }

    res.render("users/reply-contact", { contact });
};

module.exports.sendReply = async (req, res) => {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId)
        .populate("listing", "title")
        .populate("owner", "username email");

    if (!contact || !contact.owner || !contact.owner._id.equals(req.user._id)) {
        req.flash("error", "Message not found or access denied.");
        return res.redirect("/owner/messages");
    }

    const { replyMessage } = req.body;
    contact.replyMessage = replyMessage;
    contact.repliedAt = new Date();
    await contact.save();

    let emailSent = false;

    try {
        emailSent = await sendOwnerReplyEmail({
            guestEmail: contact.email,
            guestName: contact.name,
            ownerName: contact.owner.username,
            ownerEmail: contact.owner.email,
            replyMessage,
            listingTitle: contact.listing?.title || "your requested listing",
        });
    } catch (err) {
        console.log("Owner reply email failed:", err.message);
    }

    if (emailSent) {
        req.flash("success", "Reply saved and emailed to the guest.");
    } else {
        req.flash("success", "Reply saved, but email could not be sent. Check SMTP settings.");
    }

    res.redirect("/owner/messages");
};

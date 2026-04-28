const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    replyMessage: { type: String, default: "" },
    repliedAt: { type: Date },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Contact", contactSchema);

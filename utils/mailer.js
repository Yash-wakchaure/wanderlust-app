const nodemailer = require("nodemailer");

let transporter;

const canSendEmail = () => {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    );
};

const getTransporter = () => {
    if (!canSendEmail()) {
        return null;
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    return transporter;
};

module.exports.sendOwnerContactEmail = async ({
    ownerEmail,
    ownerUsername,
    senderName,
    senderEmail,
    message,
    listingTitle,
    listingId,
}) => {
    const emailTransporter = getTransporter();

    if (!emailTransporter || !ownerEmail) {
        return false;
    }

    await emailTransporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: ownerEmail,
        replyTo: senderEmail,
        subject: `New inquiry for ${listingTitle}`,
        text: [
            `Hello ${ownerUsername || "Owner"},`,
            "",
            `You received a new inquiry for your listing "${listingTitle}".`,
            "",
            `From: ${senderName}`,
            `Email: ${senderEmail}`,
            "",
            "Message:",
            message,
            "",
            `Listing link: ${process.env.BASE_URL || "http://localhost:8080"}/listings/${listingId}`,
        ].join("\n"),
    });

    return true;
};

module.exports.sendOwnerReplyEmail = async ({
    guestEmail,
    guestName,
    ownerName,
    ownerEmail,
    replyMessage,
    listingTitle,
}) => {
    const emailTransporter = getTransporter();

    if (!emailTransporter || !guestEmail) {
        return false;
    }

    await emailTransporter.sendMail({
        from: `"${ownerName || "Owner"} via Wanderlust" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`,
        to: guestEmail,
        replyTo: ownerEmail,
        subject: `Reply from ${ownerName || "Owner"} about ${listingTitle}`,
        text: [
            `Hello ${guestName || "Guest"},`,
            "",
            `${ownerName || "The owner"} replied to your inquiry for "${listingTitle}".`,
            "",
            replyMessage,
            "",
            `You can reply directly to this email to reach ${ownerName || "the owner"}.`,
        ].join("\n"),
    });

    return true;
};

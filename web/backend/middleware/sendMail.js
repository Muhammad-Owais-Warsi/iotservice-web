const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "npandian515@gmail.com",
        pass: "tedo eidb uopc avnw",
    },
});

module.exports = transport;
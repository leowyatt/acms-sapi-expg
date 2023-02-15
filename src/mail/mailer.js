const nodemailer = require("nodemailer");

const { MAIL_USER, MAIL_PASS, MAIL_HOST, MAIL_PORT, MAIL_FROM, MAIL_SITE, MAIL_SUPP } = process.env;

module.exports.mailOptions = {
  MAIL_FROM,
  MAIL_SITE,
  MAIL_SUPP,
};

module.exports.createTransport = () =>
  nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: MAIL_PORT === "465",
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });

module.exports.verifyTransport = async ({ transport }) =>
  await transport.verify().then(true).catch(false);

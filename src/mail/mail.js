const Email = require("email-templates");

const mailer = require("./mailer");
const path = require("path");

const { SERVER_URL } = process.env;

module.exports.createEmail = async (send) => {
  const transport = mailer.createTransport();
  const transported = await mailer.verifyTransport({ transport });

  if (!transported) return false;

  const createdEmail = new Email({
    views: { root: "src/api/mail/emails" },
    message: {
      subject: mailer.mailOptions.MAIL_SITE,
      from: mailer.mailOptions.MAIL_FROM,
    },
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: path.resolve("public"),
        images: true,
      },
    },
    // textOnly: true,
    transport,
    send,
  });

  return createdEmail;
};

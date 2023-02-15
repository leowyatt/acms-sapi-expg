const mail = require("./mail");
const mailer = require("./mailer");

module.exports.sendEmailVerify = async (data) => {
  const { email, emailCode, send } = data;

  const createdEmail = await mail.createEmail({ send: !send });

  const sended = await createdEmail.send({
    template: "verify",
    message: {
      to: email,
    },
    locals: {
      emailCode,
      mailSite: mailer.mailOptions.MAIL_SITE,
    },
  });

  const ret = await {
    ...data,
    emailCode: sended ? "" : emailCode,
    success: !!sended,
    info: sended ? "SENDED" : "ERROR",
  };

  return ret;
};

module.exports.sendEmailSupport = async (data) => {
  const { email, description } = data;

  const createdEmail = await mail.createEmail({ send: true });

  const sended = await createdEmail.send({
    template: "support",
    message: {
      to: mailer.mailOptions.MAIL_SUPP,
    },
    locals: {
      email,
      description,
      mailSite: mailer.mailOptions.MAIL_SITE,
    },
  });

  return sended ? await data : false;
};

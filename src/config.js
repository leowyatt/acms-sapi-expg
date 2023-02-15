require("dotenv/config");
const { boolean } = require("boolean");
const { v4: uuid } = require("uuid");

process.env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || "development",
  __DEV__: boolean(process.env.__DEV__) || true,
  CORS: process.env.CORS || ".*",
  TOKEN_SECRET: process.env.TOKEN_SECRET || uuid(),
  DATABASE_URL: process.env.DATABASE_URL || "http://db:db@127.0.0.1:4021/db",

  MAIL_HOST: process.env.MAIL_HOST || "smtp.yandex.ru",
  MAIL_PORT: process.env.MAIL_PORT || "465",
  MAIL_USER: process.env.MAIL_USER || "admin@acms.space",
  MAIL_PASS: process.env.MAIL_PASS || "csefxdbnsmtssbna",
  MAIL_FROM: process.env.MAIL_FROM || "admin@acms.space",
  MAIL_SITE: process.env.MAIL_SITE || "admin",
  MAIL_SUPP: process.env.MAIL_SUPP || "admin@acms.space",
};

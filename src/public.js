const express = require("express");
const { resolve: _resolve, join } = require("path");
const { ensureDirSync, writeFileSync, unlinkSync } = require("fs-extra");
const cors = require("cors");

module.exports.PublicExpress = () => {
  const router = express.Router();

  router.use(
    "/public",
    express.static(_resolve("public")),
    cors({
      methods: ["GET", "HEAD"],
      allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    })
  );

  return router;
};

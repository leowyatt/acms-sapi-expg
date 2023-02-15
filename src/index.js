require("./config");

const express = require("express");

const { PostgraphileExpress } = require("./postgraphile");
const { AuthExpress } = require("./auth");
const { PublicExpress } = require("./public");
const { createPgPool } = require("./pg");

const startPostgraphileServer = async () => {
  const pgPool = createPgPool();
  const app = express();

  await pgPool.connect().then(async () => {
    console.info(`🚀 Server PG is ready at postgres://127.0.0.1:4021`);

    app.use(PublicExpress(), AuthExpress(), PostgraphileExpress(pgPool));

    app.get("/ping", (req, res) => {
      res.status(200).send("Ok");
    });

    await new Promise((r) => app.listen("4010", "0.0.0.0", r));

    console.info(`🚀 Server API is ready at http://0.0.0.0:4010/graphql`);
  });
};

startPostgraphileServer();

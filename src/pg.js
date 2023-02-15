const pg = require("pg");

const { __DEV__, DATABASE_URL } = process.env;

module.exports.createPgPool = () =>
  new pg.Pool({
    connectionString: DATABASE_URL,
    max: 300,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 5000,
  });

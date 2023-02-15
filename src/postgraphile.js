const path = require("path");
const OperationHooks = require("@graphile/operation-hooks").default;
const { NodePlugin } = require("graphile-build");
const { postgraphile, makePluginHook } = require("postgraphile");

const PgManyToManyPlugin = require("@graphile-contrib/pg-many-to-many").default;
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");
const PgSubscriptionsLdsPlugin = require("@graphile/subscriptions-lds").default;
const PgAggregatesPlugin = require("@graphile/pg-aggregates").default;
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector").default;
const PostGraphileUploadFieldPlugin = require("postgraphile-plugin-upload-field");
const { postgraphilePolyRelationCorePlugin } = require("postgraphile-polymorphic-relation-plugin");
const { PgMutationUpsertPlugin } = require("postgraphile-upsert-plugin");

const { AuthOptions, AuthPlugin } = require("./auth");

const { __DEV__, DATABASE_URL } = process.env;

module.exports.PostgraphileExpress = (pgPool) =>
  postgraphile(pgPool, "public", {
    // exportGqlSchemaPath: path.resolve("public/schema.qgl"),
    ownerConnectionString: DATABASE_URL,
    watchPg: __DEV__,
    graphiql: __DEV__,
    enhanceGraphiql: __DEV__,
    pluginHook: makePluginHook([OperationHooks]),
    appendPlugins: [
      AuthPlugin,
      PgSimplifyInflectorPlugin,
      PgMutationUpsertPlugin,
      ConnectionFilterPlugin,
      // postgraphilePolyRelationCorePlugin,
      PgSubscriptionsLdsPlugin,
      PgAggregatesPlugin,
      // PgManyToManyPlugin,
    ],
    // skipPlugins: [NodePlugin],
    graphileBuildOptions: {
      connectionFilterRelations: true,
      connectionFilterPolymorphicForward: true,
      connectionFilterPolymorphicBackward: true,
    },
    ignoreRBAC: false,
    dynamicJson: true,
    disableQueryLog: true,
    subscriptions: true,
    subscriptionEventEmitterMaxListeners: 20,
    live: true,
    retryOnInitFail: true,
    setofFunctionsContainNulls: false,
    enableQueryBatching: true,
    legacyRelations: "omit",
    showErrorStack: __DEV__,
    extendedErrors: __DEV__ ? ["hint", "detail", "errcode"] : ["errcode"],
    operationMessages: false,
    operationMessagesPreflight: false,
    disableDefaultMutations: true,
    ...AuthOptions(),
  });

const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Router } = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");

const { sendEmailVerify, sendEmailSupport } = require("./mail/sender");

const { __DEV__, CORS, TOKEN_SECRET } = process.env;

const callbackLogin = (result, args, context, resolveInfo) => {
  const data = result.data && result.data["@token"];
  if (!data) return false;

  context.delCookieToken();
  context.setCookieToken(data);

  return result;
};

const callback = {
  // auth
  user_login: (result, args, context, resolveInfo) =>
    callbackLogin(result, args, context, resolveInfo),

  user_register: (result, args, context, resolveInfo) => {
    return result;
  },

  user_logout: (result, args, context, resolveInfo) => {
    context.delCookieToken();
    return result;
  },

  user_update: (result, args, context, resolveInfo) => {
    return result;
  },

  // email
  user_email_check: (result, args, context, resolveInfo) => {
    const data = result?.data && result.data["@emailVerify"];

    if (!data) return false;

    const ret = sendEmailVerify(data);

    return { data: { "@emailVerify": ret } };
  },

  user_email_login: (result, args, context, resolveInfo) =>
    callbackLogin(result, args, context, resolveInfo),

  user_email_verify: (result, args, context, resolveInfo) => {
    return result;
  },

  support: (result, args, context, resolveInfo) => {
    const data = result?.data && result.data["@support"];

    if (!data) return false;

    const ret = sendEmailSupport(data);

    return { data: { "@support": ret } };
  },
};

// JWT
const jwtEncode = (data) => jwt.sign(data, TOKEN_SECRET, { algorithm: "HS256" });

const jwtDecode = (token) => jwt.verify(token, TOKEN_SECRET, { algorithm: "HS256" });

// COOKIES
// -- CookieToken
const getCookieToken = (req, res) => {
  const token = req?.signedCookies["token"];
  return token && jwtDecode(token);
};
const getCookieTokenAsync = async (req, res) => {
  const token = req?.signedCookies && req?.signedCookies["token"];
  return token && jwtDecode(token);
};
const delCookieToken = async (req, res) => {
  return await res.clearCookie("token", {
    path: "/",
    domain: req.hostname,
  });
};
const setCookieToken = async (req, res, data) => {
  return await res.cookie("token", jwtEncode(data), {
    signed: true,
    httpOnly: true,
    sameSite: __DEV__ ? "Lax" : "None",
    secure: !__DEV__,
    expires: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
    domain: req.hostname,
  });
};

const getDomain = async (hostname, domains) => {
  return await domains?.filter((el) => hostname?.includes(el));
};

// FUNC
const additionalGraphQLContextFromRequest = async (req, res) => ({
  getCookieToken: () => getCookieToken(req),
  getCookieTokenAsync: async () => await getCookieTokenAsync(req, res),
  setCookieToken: (data) => setCookieToken(req, res, data),
  delCookieToken: () => delCookieToken(req, res),
  getPgSettings: () => getPgSettings(req, res),
  sendEmailVerify: async (data) => await sendEmailVerify(req, res, data),
});

const getPgSettings = async (req, res) => {
  const data =
    req?.headers["connection"] === "Upgrade" ? await getCookieTokenAsync(req) : getCookieToken(req);

  return {
    role: data ? data.role : "GUEST",
    "jwt.claims.id": data ? data.userId : "",
    "jwt.claims.sub": data ? data.profileId : "",
  };
};

module.exports.AuthOptions = () => ({
  graphiqlCredentials: "include",
  pgSettings: getPgSettings,
  additionalGraphQLContextFromRequest,
});

module.exports.AuthExpress = () => {
  const router = Router();

  router.use(helmet());
  router.use(compression());
  router.use(cookieParser(TOKEN_SECRET));
  router.use("trust proxy", () => ["0.0.0.0"]);
  router.use(
    cors({
      credentials: true,
      origin: (origin, callback) => {
        // CORS from ENV
        return origin?.match(new RegExp(CORS, "ig")) || !origin
          ? callback(null, true)
          : callback(new Error("Not allowed by CORS"));
      },
    })
  );

  return router;
};

const usePlugin = (build) => (fieldContext) => {
  const {
    scope: { isRootMutation, pgFieldIntrospection },
  } = fieldContext;

  if (!isRootMutation || !pgFieldIntrospection) return null;

  if (Object.keys(callback).includes(pgFieldIntrospection.name)) {
    return {
      before: [],
      after: [{ priority: 1000, callback: callback[pgFieldIntrospection.name] }],
      error: [],
    };
  }
};

module.exports.AuthPlugin = (builder) => {
  builder.hook("init", (_, build) => {
    build.addOperationHook(usePlugin(build));
    return _;
  });
};

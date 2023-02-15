###############################################################################

FROM node:16-bullseye as node
FROM node as sapi
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY ./src ./src

FROM sapi as api
ENV NODE_ENV="development"
ENV TOKEN_SECRET="$(yarn uuid v4)"
ENV SKIP_PREFLIGHT_CHECK="true"
CMD yarn nodemon ./src/index.js

###############################################################################

FROM postgis/postgis:14-master as postgis
FROM postgis as db
RUN apt-get update && apt-get install postgresql-14-wal2json

###############################################################################

FROM dpage/pgadmin4:latest as pgadmin
FROM pgadmin as dba

###############################################################################

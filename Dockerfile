FROM rust:alpine AS rustbuilder

WORKDIR /app

ENV GRPC_HOST=0.0.0.0:50053

RUN apk upgrade --update-cache --available && \
	apk add npm gcc cmake make g++ protoc protobuf-dev

RUN npm install @a11ywatch/protos

COPY . .

RUN cargo install --no-default-features --path .

FROM node:19.0-alpine AS installer 

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

FROM node:19.0-alpine AS builder 

WORKDIR /usr/src/app

COPY --from=installer /usr/src/app/node_modules ./node_modules
COPY . .
RUN  npm run build
RUN rm -R ./node_modules
RUN npm install --production

FROM node:19.0-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=rustbuilder /usr/local/cargo/bin/health_client /usr/local/bin/health_client

CMD [ "node", "--no-experimental-fetch", "./dist/server.js"]

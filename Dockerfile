FROM --platform=$BUILDPLATFORM rustlang/rust:nightly AS rustbuilder

WORKDIR /app

ENV GRPC_HOST=0.0.0.0:50053

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc cmake libc6 npm

RUN npm install @a11ywatch/protos

COPY . .

RUN cargo install --no-default-features --path .

FROM node:18.4-buster-slim AS installer 

WORKDIR /usr/src/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	python3 \
	pkg-config \
	make \
	gcc

COPY package*.json ./

RUN npm ci

FROM node:18.4-buster-slim AS builder 

WORKDIR /usr/src/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	python3 \
	pkg-config \
	make \
	gcc

COPY --from=installer /usr/src/app/node_modules ./node_modules
COPY . .
RUN  npm run build
RUN rm -R ./node_modules
RUN npm install --production

FROM node:18.4-buster-slim

WORKDIR /usr/src/app

# required runtime deps
RUN apt-get update && \
    apt-get install -y build-essential
	
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=rustbuilder /usr/local/cargo/bin/health_client /usr/local/bin/health_client

CMD [ "node", "--no-experimental-fetch", "./dist/server.js"]

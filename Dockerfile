FROM node:17-buster-slim AS builder 

WORKDIR /usr/src/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	python3 \
	pkg-config \
	make \
	gcc \ 
    libpixman-1-dev \
	libc6-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

COPY package*.json ./

RUN npm ci

COPY . .

RUN  npm run build

FROM node:17-buster-slim AS installer 

WORKDIR /usr/src/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	python3 \
	pkg-config \
	make \
	gcc \ 
    libpixman-1-dev \
	libc6-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

COPY package*.json ./

RUN npm install --production

FROM node:17-buster-slim

WORKDIR /usr/src/app

RUN apt-get update && \ 
	apt-get install -y \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev
	
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=installer /usr/src/app/node_modules ./node_modules

CMD [ "node", "./dist/server.js"]

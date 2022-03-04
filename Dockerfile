FROM tensorflow/tensorflow:latest AS BUILD_IMAGE 

WORKDIR /usr/src/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	wget \
	npm \
	bash \
	python3 \
    pkg-config \
	make \
	gcc \ 
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

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install -y nodejs

COPY package*.json ./

RUN npm i -g npm@latest

RUN npm ci

COPY . .

RUN  npm run build

FROM tensorflow/tensorflow:latest

WORKDIR /usr/src/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	npm \
	bash \
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

RUN npm i -g npm@latest

# copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/.env ./.env
COPY --from=BUILD_IMAGE /usr/bin/node /usr/bin/node

RUN npm install --production


CMD [ "npm", "run", "start"]

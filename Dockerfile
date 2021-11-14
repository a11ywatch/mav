FROM tensorflow/tensorflow:latest-devel

WORKDIR /usr/src/app

RUN apt-get update && \ 
	apt-get install -y build-essential \
	wget \
	npm \
	bash \
	python3 \
	make \
	gcc \ 
	libc6-dev 
    
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install -y nodejs

COPY package*.json ./

RUN npm ci

COPY . .

RUN  npm run build

CMD [ "/usr/bin/node", "./dist/server.js"]

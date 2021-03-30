FROM jeffmendez19/tensorflow-node-gpu as stage

WORKDIR /usr/src/app

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install -y nodejs

COPY package*.json ./

RUN npm ci

COPY . .

RUN  npm run build

FROM jeffmendez19/tensorflow-node-gpu

WORKDIR /usr/src/app

COPY --from=stage /usr/src/app/dist ./dist
COPY --from=stage /usr/src/app/node_modules ./node_modules
COPY --from=stage /usr/bin/node /usr/bin/node

CMD [ "/usr/bin/node", "./dist/server.js"]

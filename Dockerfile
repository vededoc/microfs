FROM node:16-alpine
WORKDIR /app
RUN npm i -g @vededoc/l4app
ADD dist /app
RUN mkdir /data
RUN mkdir /data/files
RUN mkdir /data/logs
COPY package.json ./
COPY config.yaml ./
RUN yarn --production

ENV NODE_ENV production
ENV NPM_CONFIG_LOGLEVEL warn

CMD ["l4app", "-w", "/data/logs", "node", "--", "main.js"]


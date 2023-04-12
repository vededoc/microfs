FROM node:16-alpine
ARG DB_HOST=localhost
ARG DB_NAME=microfs
ARG DB_USER=microfs
ARG DB_PASSWORD=vkdlftjqj!@
ARG BASE_PATH=/microfs/v1
ARG EXTERNAL_ADDR
ARG STORAGE_PATH=/data/microfs/files
WORKDIR /app
RUN npm i -g @vededoc/l4app
ADD dist /app
RUN mkdir -p /data/microfs/files
RUN mkdir -p /data/microfs/logs
COPY package.json ./
RUN yarn --production

ENV NODE_ENV production
ENV DB_HOST $DB_HOST
ENV DB_NAME $DB_NAME
ENV DB_USER $DB_USER
ENV EXTERNAL_ADDR $EXTERNAL_ADDR
ENV STORAGE_PATH $STORAGE_PATH
ENV DB_PASSWORD $DB_PASSWORD
ENV NPM_CONFIG_LOGLEVEL warn
CMD ["l4app", "-w", "/data/microfs/logs", "node", "--", "main.js"]

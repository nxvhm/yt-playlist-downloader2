FROM node:16-alpine3.16
RUN mkdir -p /home/node/node_modules && mkdir /home/node/bullqueue && chown -R node:node /home/node
USER root
RUN apk add bash ffmpeg
USER node
WORKDIR /home/node
COPY --chown=node:node ./package*.json .
ENV PATH=/home/node/node_modules/.bin:$PATH
RUN npm install 
CMD ["npm", "start"]

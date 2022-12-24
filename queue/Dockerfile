FROM node:16-alpine3.16
RUN mkdir -p /home/node/bullqueue/node_modules && chown -R node:node /home/node/bullqueue
USER node
WORKDIR /home/node/bullqueue
COPY --chown=node:node ./package*.json ./
RUN npm install 
CMD ["npm", "start"]

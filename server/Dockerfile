FROM node:16-alpine3.16
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
USER node
WORKDIR /home/node/app
COPY --chown=node:node ./package*.json ./
RUN npm install
EXPOSE ${PORT}
CMD ["npm", "start"]
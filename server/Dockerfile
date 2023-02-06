FROM node:16-alpine3.16
RUN mkdir -p /home/node/node_modules && mkdir /home/node/server && chown -R node:node /home/node
USER node
WORKDIR /home/node/
COPY --chown=node:node ./package*.json .
COPY --chown=node:node ./.env.example ./.env
ENV PATH=/home/node/node_modules/.bin:$PATH
RUN npm install
EXPOSE ${PORT}
CMD ["npm", "start"]
FROM node:10

COPY ./src/cli/bin.js /app/src/cli/bin.js
COPY ./package.json /app/package.json

RUN cd app && npm install && npm link

COPY ./src /app/src

EXPOSE 50321

CMD ipfs-npm

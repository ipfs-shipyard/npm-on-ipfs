FROM node:8.11.3

COPY ./src/cli/bin.js /app/src/cli/bin.js
COPY ./package.json /app/package.json

RUN cd app && npm install && npm link

COPY ./src /app/src

CMD registry-mirror

FROM node:18.16.0-alpine
WORKDIR /app
COPY . /app
RUN npm ci
CMD npm run watch
EXPOSE 3000
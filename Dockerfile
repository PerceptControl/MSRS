FROM node:18-buster
WORKDIR /code

COPY . .
COPY package*.json ./
RUN npm install

EXPOSE 80

CMD ["node", "./lib/app.js"]
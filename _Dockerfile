FROM node:5

WORKDIR /usr/src/app

ADD package.json ./
RUN npm install --production
ADD . .

CMD ["npm", "start"]

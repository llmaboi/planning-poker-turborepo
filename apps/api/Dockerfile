FROM node:lts

WORKDIR /usr/src/api

# Copy root package.json and lockfile
COPY package.json ./
COPY package-lock.json ./
# COPY wait-for-it.sh ./
# COPY .env.test ./

# Copy the api package.json
COPY apps/api/package.json ./apps/api/package.json

RUN npm install
RUN npm i -g nodemon

# Copy app source
COPY . .

EXPOSE 3500

CMD [ "./wait-for-it.sh", "192.168.0.2:3306", "-s", "--", "nodemon", "apps/api/src/index.ts" ]
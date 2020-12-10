# Create image based on the official Node 10 image from dockerhub
FROM alpine:3.12.1

# Change directory so that our commands run inside this new directory
WORKDIR /usr/src/app

EXPOSE 4200

# Copy dependency definitions
COPY package*.json ./

# Install dependecies
RUN apk add --update npm
RUN npm install -g @angular/cli && npm install

# Get all the code needed to run the app
COPY . .

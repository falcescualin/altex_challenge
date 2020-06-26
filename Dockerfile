#Each instruction in this file creates a new layer
#Here we are getting our node as Base image
FROM node:latest
#Creating a new directory for app files and setting path in the container
RUN mkdir -p /app/altex_challenge
#setting working directory in the container
WORKDIR /app/altex_challenge
#copying the package.json file(contains dependencies) from project source dir to container dir
COPY package*.json ./
# installing the dependencies into the container
RUN npm -s install -q
RUN npm -s install -g @babel/node -q
RUN npm -s install -g @babel/core -q

RUN npm uninstall bcrypt
RUN npm install bcrypt@latest --save
RUN npm rebuild bcrypt --build-from-source
#copying the source code of Application into the container dir
COPY . .
#container exposed network port number
EXPOSE 80
#command to run within the container

ENV NODE_ENV="DEVELOPMENT"
ENV PORT=80
ENV HOST="0.0.0.0"
ENV MONGODB_URL="mongodb://mongo:27017/altex"
ENV BCRYPT_SECRET=10
ENV JWT_SECRET="CELMAITARESECRETEVAAAAA"
ENV LOG_LEVEL="debug"

CMD ["npm", "start"]



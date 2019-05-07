FROM node:10-alpine
ADD . /code
WORKDIR /code
RUN npm install -g nodemon
RUN npm install

EXPOSE 8080
CMD ["npm", "run" , "live"]

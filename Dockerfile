FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]

# docker build -t finance-madanilab-api-1.0-img .
# docker run -d -p 3000:3000 --name finance-madanilab-api-1.0 finance-madanilab-api-1.0-img
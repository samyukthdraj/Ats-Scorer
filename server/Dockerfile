FROM node:18-alpine

RUN apk add --no-cache python3

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . . 

# Create uploads directory
RUN mkdir -p uploads
RUN chmod 777 uploads

EXPOSE 5000
CMD ["node", "server.js"]
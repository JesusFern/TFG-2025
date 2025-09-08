FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Compilar TypeScript a JavaScript
RUN npx tsc

EXPOSE 5000

CMD ["npm", "start"]

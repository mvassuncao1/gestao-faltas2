# Estágio de construção (Build Stage)
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Estágio de produção (Production Stage)
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=build /usr/src/app/dist ./dist
COPY server.js ./

EXPOSE 3000

CMD ["npm", "start"]

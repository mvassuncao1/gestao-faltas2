# Estágio de construção (Build Stage)
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Estágio de produção (Production Stage)
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src ./src

# Se houver um servidor Node.js/Express, copie-o e rode-o.
# Caso contrário, sirva os arquivos estáticos.
EXPOSE 3000

CMD ["npm", "run", "dev"]

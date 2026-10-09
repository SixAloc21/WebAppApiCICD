FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV PORT=80
ENV TCP_PORT=6061

EXPOSE 80
EXPOSE 6061

CMD ["node", "src/app.js"]
FROM node:25 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . ./

RUN npm run build


FROM node:25 AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

CMD ["node", "build/bin/server.js"]

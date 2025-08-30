# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .


RUN npm run build

# ===== Stage 2: Production (minimal image) =====
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm ci --only=production
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/.next ./.next



EXPOSE 9002

CMD ["npm", "start"]

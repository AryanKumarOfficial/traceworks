FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml* ./
RUN npm install --omit=dev

EXPOSE 5000
CMD ["node", "dist/src/main.js"]

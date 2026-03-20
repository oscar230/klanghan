FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle

# Mount volume for persistent sqlite data
VOLUME ["/app/data"]
ENV DATABASE_URL=data/sqlite.db
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "build"]

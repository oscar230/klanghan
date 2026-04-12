# Build code
FROM node:lts AS builder
ENV NPM_CONFIG_LOGLEVEL=info

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV DATABASE_URL=data/sqlite.db
RUN npm run build
RUN npm prune --omit=dev

# Build image
FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle

# Create data directory and set permissions
RUN mkdir -p /app/data

# Mount volume for persistent sqlite data
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/sqlite.db

EXPOSE 3000
CMD ["node", "build/index.js"]


# Build stage
FROM node:lts-alpine AS builder

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Set a temporary database URL for the build phase
ENV DATABASE_URL=data/sqlite.db
RUN npm run build
RUN npm prune --omit=dev

# Runtime stage
FROM node:lts-alpine
WORKDIR /app

# Install runtime dependencies if needed (none for pure node/sqlite usually)
# but we need to copy node_modules and the rest
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle

# Create persistent data directory
RUN mkdir -p /app/data

# Mount volume for persistent sqlite data
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/sqlite.db

EXPOSE 3000
CMD ["node", "build/index.js"]

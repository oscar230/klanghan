# Build
FROM node:lts-bookworm as builder
WORKDIR /app
COPY package*.json svelte.config.js vite.config.ts ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Release
FROM lipanski/docker-static-website:latest
COPY --from=builder /app/build .
CMD ["/busybox-httpd", "-f", "-v", "-p", "3000", "-c", "httpd.conf"]
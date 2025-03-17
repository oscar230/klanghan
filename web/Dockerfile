# Build
FROM node:lts-bookworm as builder
WORKDIR /app/web
COPY web/package*.json web/svelte.config.js web/vite.config.ts ./
RUN npm ci
COPY web/ .
RUN npm run build
RUN npm prune --omit=dev

# Release
FROM lipanski/docker-static-website:latest
COPY --from=builder /app/web/build .
CMD ["/busybox-httpd", "-f", "-v", "-p", "3000", "-c", "httpd.conf"]
# Stage 1: Build the Go API
FROM golang:1.23-bookworm as go-builder
WORKDIR /app/api
COPY api/go.mod api/go.sum ./
RUN go mod download
COPY api/ .
RUN go build -o /api .

# Stage 2: Build the SvelteKit app
FROM node:lts-bookworm as node-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ .
RUN npm run build
RUN npm prune --omit=dev

# Stage 3: Final image to combine Go API and SvelteKit
FROM node:lts-bookworm
COPY --from=go-builder /api /usr/local/bin/api
COPY --from=node-builder /app/web/.svelte-kit /usr/share/nginx/html
EXPOSE 5200
EXPOSE 5201
ENV NODE_ENV=production
# Start both Go API and Nginx to serve the SvelteKit app
CMD ["/bin/sh", "-c", "/usr/local/bin/api & nginx -g 'daemon off;'"]
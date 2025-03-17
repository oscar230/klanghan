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
FROM debian:bookworm
RUN apt-get update && apt-get install -y nginx
RUN mkdir -p /var/api
COPY --from=go-builder /api/api /var/api
COPY --from=node-builder /app/web/build /var/www/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
ENV NODE_ENV=production
CMD ["sh", "-c", "/var/api/api & nginx -g 'daemon off;'"]